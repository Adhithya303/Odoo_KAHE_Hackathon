"""Trips router — CRUD, itinerary, management."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip, TripStop
from app.models.activity import TripStopActivity, Activity
from app.schemas.trip import TripCreate, TripUpdate, TripStopCreate
from app.schemas.itinerary import (
    GenerateItineraryRequest, TripStopActivityCreate,
    ReorderRequest, ItinerarySaveRequest,
)
from app.services.trip_service import generate_itinerary, optimize_route, suggest_places
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta

router = APIRouter(prefix="/api/trips", tags=["trips"])


# ═══════════════════════════════════════════════════════════
#  Helpers
# ═══════════════════════════════════════════════════════════

def trip_to_dict(trip, include_stops=False):
    # Derive destination_name from first stop
    dest_name = None
    if trip.stops:
        first = trip.stops[0]
        dest_name = first.destination.name if first.destination else first.custom_place

    data = {
        "id": trip.id, "user_id": trip.user_id, "name": trip.name,
        "description": trip.description, "cover_photo_url": trip.cover_photo_url,
        "start_date": str(trip.start_date), "end_date": str(trip.end_date),
        "total_budget": float(trip.total_budget) if trip.total_budget else None,
        "predicted_budget": float(trip.predicted_budget) if trip.predicted_budget else None,
        "visibility": trip.visibility, "status": trip.status,
        "trip_scope": trip.trip_scope, "duration_days": trip.duration_days,
        "destination_name": dest_name,
    }
    if include_stops and trip.stops:
        data["stops"] = [{
            "id": s.id, "destination_id": s.destination_id,
            "destination_name": s.destination.name if s.destination else s.custom_place,
            "custom_place": s.custom_place,
            "section_title": s.section_title,
            "description": s.description,
            "arrival_date": str(s.arrival_date) if s.arrival_date else None,
            "departure_date": str(s.departure_date) if s.departure_date else None,
            "sort_order": s.sort_order,
            "stop_budget": float(s.stop_budget) if s.stop_budget else None,
            "latitude": float(s.latitude) if s.latitude else None,
            "longitude": float(s.longitude) if s.longitude else None,
        } for s in trip.stops]
    return data


def _get_last_planned_date(trip: Trip) -> date:
    candidate_dates = [d for d in [trip.start_date, trip.end_date] if d]

    for stop in trip.stops or []:
        if stop.arrival_date:
            candidate_dates.append(stop.arrival_date)
        if stop.departure_date:
            candidate_dates.append(stop.departure_date)
        for activity in stop.activities or []:
            if activity.scheduled_date:
                candidate_dates.append(activity.scheduled_date)

    return max(candidate_dates) if candidate_dates else date.today()


def _get_next_plan_date(trip: Trip) -> date:
    return _get_last_planned_date(trip) + timedelta(days=1)


def _extend_trip_dates_for_new_plan_item(trip: Trip, target_date: date) -> None:
    if not trip.start_date or target_date < trip.start_date:
        trip.start_date = target_date
    if not trip.end_date or target_date > trip.end_date:
        trip.end_date = target_date


def _extend_stop_dates_for_new_plan_item(stop: TripStop, target_date: date) -> None:
    if not stop.arrival_date or target_date < stop.arrival_date:
        stop.arrival_date = target_date
    if not stop.departure_date or target_date > stop.departure_date:
        stop.departure_date = target_date


# ═══════════════════════════════════════════════════════════
#  Trip CRUD
# ═══════════════════════════════════════════════════════════

@router.get("")
def list_trips(status: Optional[str] = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Trip).filter(Trip.user_id == user.id)
    if status:
        query = query.filter(Trip.status == status)
    return {"trips": [trip_to_dict(t) for t in query.order_by(Trip.created_at.desc()).all()]}


@router.post("")
def create_trip(req: TripCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.end_date < req.start_date:
        raise HTTPException(400, "End date must be after start date")

    # Normalise visibility to lowercase enum value
    vis = (req.visibility or "private").lower()
    if vis not in ("private", "public"):
        vis = "private"

    trip = Trip(
        user_id=user.id, name=req.name, description=req.description,
        cover_photo_url=req.cover_photo_url,
        start_date=req.start_date, end_date=req.end_date,
        total_budget=req.total_budget, trip_scope=req.trip_scope,
        visibility=vis,
    )
    db.add(trip)
    db.flush()

    # Multi-stop support
    if req.stops:
        for idx, stop_data in enumerate(req.stops):
            stop = TripStop(
                trip_id=trip.id,
                destination_id=stop_data.destination_id,
                custom_place=stop_data.custom_place,
                section_title=stop_data.section_title or stop_data.custom_place,
                description=stop_data.description,
                arrival_date=stop_data.arrival_date or req.start_date,
                departure_date=stop_data.departure_date or req.end_date,
                stop_budget=stop_data.stop_budget,
                sort_order=idx,
            )
            db.add(stop)
    elif req.destination_id:
        # Single destination fallback
        db.add(TripStop(
            trip_id=trip.id, destination_id=req.destination_id,
            arrival_date=req.start_date, departure_date=req.end_date, sort_order=0
        ))

    db.commit()
    db.refresh(trip)
    return trip_to_dict(trip, include_stops=True)


@router.get("/{trip_id}")
def get_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    return trip_to_dict(trip, include_stops=True)


@router.put("/{trip_id}")
def update_trip(trip_id: int, req: TripUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    data = req.model_dump(exclude_unset=True)

    if "add_stop" in data:
        stop_name = data.pop("add_stop")
        from app.models.destination import Destination
        dest = db.query(Destination).filter(Destination.name.ilike(stop_name)).first()
        next_plan_date = _get_next_plan_date(trip)
        new_stop = TripStop(
            trip_id=trip.id,
            destination_id=dest.id if dest else None,
            custom_place=None if dest else stop_name,
            section_title=stop_name,
            arrival_date=next_plan_date,
            departure_date=next_plan_date,
            sort_order=len(trip.stops)
        )
        db.add(new_stop)
        _extend_trip_dates_for_new_plan_item(trip, next_plan_date)

    # Normalise visibility
    if "visibility" in data and data["visibility"]:
        data["visibility"] = data["visibility"].lower()

    for field, value in data.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip_to_dict(trip, include_stops=True)


@router.delete("/{trip_id}")
def delete_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted"}


@router.post("/{trip_id}/duplicate")
def duplicate_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    new = Trip(user_id=user.id, name=f"{trip.name} (Copy)", description=trip.description,
               start_date=trip.start_date, end_date=trip.end_date,
               total_budget=trip.total_budget, trip_scope=trip.trip_scope, status="planning")
    db.add(new)
    db.commit()
    db.refresh(new)
    return trip_to_dict(new)


@router.post("/{trip_id}/copy")
def copy_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    original = db.query(Trip).filter(Trip.id == trip_id).first()
    if not original:
        raise HTTPException(404, "Original trip not found")

    duration = (original.end_date - original.start_date).days
    new_start = date.today()
    new_end = new_start + timedelta(days=duration)

    new_trip = Trip(
        user_id=user.id, name=f"Copy of {original.name}",
        description=original.description, cover_photo_url=original.cover_photo_url,
        start_date=new_start, end_date=new_end,
        total_budget=original.total_budget, visibility="private",
        status="planning", trip_scope=original.trip_scope
    )
    db.add(new_trip)
    db.flush()

    for stop in original.stops:
        arrival_offset = (stop.arrival_date - original.start_date).days if stop.arrival_date else 0
        departure_offset = (stop.departure_date - original.start_date).days if stop.departure_date else 0
        new_stop = TripStop(
            trip_id=new_trip.id, destination_id=stop.destination_id,
            custom_place=stop.custom_place, section_title=stop.section_title,
            description=stop.description,
            arrival_date=new_start + timedelta(days=arrival_offset) if stop.arrival_date else None,
            departure_date=new_start + timedelta(days=departure_offset) if stop.departure_date else None,
            sort_order=stop.sort_order, stop_budget=stop.stop_budget,
            latitude=stop.latitude, longitude=stop.longitude
        )
        db.add(new_stop)
        db.flush()
        for sa in stop.activities:
            new_sa = TripStopActivity(
                stop_id=new_stop.id, activity_id=sa.activity_id,
                scheduled_date=new_start + timedelta(days=(sa.scheduled_date - original.start_date).days) if sa.scheduled_date else None,
                start_time=sa.start_time, end_time=sa.end_time,
                actual_cost=sa.actual_cost, notes=sa.notes, sort_order=sa.sort_order
            )
            db.add(new_sa)

    db.commit()
    db.refresh(new_trip)
    return trip_to_dict(new_trip, include_stops=True)


# ═══════════════════════════════════════════════════════════
#  Stop management
# ═══════════════════════════════════════════════════════════

@router.post("/{trip_id}/stops")
def add_stop(trip_id: int, req: TripStopCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    next_plan_date = _get_next_plan_date(trip)
    stop = TripStop(
        trip_id=trip.id,
        destination_id=req.destination_id,
        custom_place=req.custom_place,
        section_title=req.section_title or req.custom_place,
        description=req.description,
        arrival_date=req.arrival_date or next_plan_date,
        departure_date=req.departure_date or req.arrival_date or next_plan_date,
        stop_budget=req.stop_budget,
        sort_order=len(trip.stops),
    )
    db.add(stop)
    _extend_trip_dates_for_new_plan_item(trip, stop.departure_date or stop.arrival_date)
    db.commit()
    db.refresh(trip)
    return trip_to_dict(trip, include_stops=True)


@router.put("/{trip_id}/stops/{stop_id}")
def update_stop(trip_id: int, stop_id: int, req: TripStopCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(404, "Stop not found")

    data = req.model_dump(exclude_unset=True)
    for field, value in data.items():
        if value is not None:
            setattr(stop, field, value)
    db.commit()
    db.refresh(trip)
    return trip_to_dict(trip, include_stops=True)


@router.delete("/{trip_id}/stops/{stop_id}")
def delete_stop(trip_id: int, stop_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(404, "Stop not found")
    db.delete(stop)
    db.commit()
    return {"message": "Stop deleted"}


# ═══════════════════════════════════════════════════════════
#  Itinerary — GET / PUT / Generate
# ═══════════════════════════════════════════════════════════

@router.get("/{trip_id}/itinerary")
def get_itinerary(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).order_by(TripStop.sort_order).all()
    result = []
    for stop in stops:
        acts = db.query(TripStopActivity).filter(
            TripStopActivity.stop_id == stop.id
        ).order_by(TripStopActivity.sort_order).all()

        # Return in the flat format the frontend builder expects
        result.append({
            "id": stop.id,
            "title": stop.section_title or (stop.destination.name if stop.destination else stop.custom_place) or f"Stop {stop.sort_order + 1}",
            "description": stop.description or "",
            "start_date": str(stop.arrival_date) if stop.arrival_date else str(trip.start_date),
            "end_date": str(stop.departure_date) if stop.departure_date else str(trip.end_date),
            "budget_allocated": float(stop.stop_budget) if stop.stop_budget else 0,
            "destination_name": stop.destination.name if stop.destination else stop.custom_place,
            "activities": [{
                "id": a.id,
                "time": str(a.start_time)[:5] if a.start_time else "10:00",
                "name": a.activity.name if a.activity else "",
                "description": a.activity.description if a.activity else "",
                "cost": float(a.activity.estimated_cost) if a.activity and a.activity.estimated_cost else 0,
                "category": a.notes or "Sightseeing",
            } for a in acts],
        })
    return {"itinerary": result}


@router.put("/{trip_id}/itinerary")
def save_itinerary(trip_id: int, req: ItinerarySaveRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Save the full itinerary (replaces all existing stops & activities)."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    # Delete existing stop activities first, then stops
    existing_stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).all()
    for s in existing_stops:
        db.query(TripStopActivity).filter(TripStopActivity.stop_id == s.id).delete()
    db.query(TripStop).filter(TripStop.trip_id == trip_id).delete()
    db.flush()

    # Create new stops with activities
    for idx, section in enumerate(req.sections):
        # Parse dates
        arr_date = None
        dep_date = None
        try:
            if section.start_date:
                arr_date = datetime.strptime(section.start_date, "%Y-%m-%d").date()
            if section.end_date:
                dep_date = datetime.strptime(section.end_date, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            pass

        stop = TripStop(
            trip_id=trip_id,
            section_title=section.title,
            description=section.description,
            arrival_date=arr_date or trip.start_date,
            departure_date=dep_date or trip.end_date,
            stop_budget=section.budget_allocated or 0,
            sort_order=idx,
        )
        db.add(stop)
        db.flush()

        for act_idx, act_data in enumerate(section.activities):
            activity = Activity(
                name=act_data.name,
                description=act_data.description or "",
                estimated_cost=act_data.cost or 0,
                source="manual",
            )
            db.add(activity)
            db.flush()

            start_time = None
            if act_data.time:
                try:
                    start_time = datetime.strptime(act_data.time, "%H:%M").time()
                except (ValueError, TypeError):
                    pass

            stop_activity = TripStopActivity(
                stop_id=stop.id,
                activity_id=activity.id,
                start_time=start_time,
                notes=act_data.category or "Sightseeing",
                sort_order=act_idx,
            )
            db.add(stop_activity)

    db.commit()
    return {"message": "Itinerary saved", "sections": len(req.sections)}


@router.post("/{trip_id}/itinerary/generate")
async def gen_itinerary(trip_id: int, req: GenerateItineraryRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    return await generate_itinerary(db, trip, req.interests, req.hotel_type)


# ═══════════════════════════════════════════════════════════
#  Activity management within stops
# ═══════════════════════════════════════════════════════════

@router.post("/{trip_id}/itinerary/activities")
def add_activity(trip_id: int, req: TripStopActivityCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    if req.activity_name and not req.activity_id:
        act = Activity(name=req.activity_name, description=req.activity_description, source="manual")
        db.add(act)
        db.flush()
        activity_id = act.id
    else:
        activity_id = req.activity_id
    stop = db.query(TripStop).filter(TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(400, "No stops found")
    scheduled_date = req.scheduled_date or _get_next_plan_date(trip)
    sa = TripStopActivity(
        stop_id=stop.id,
        activity_id=activity_id,
        scheduled_date=scheduled_date,
        notes=req.notes,
        sort_order=0,
    )
    db.add(sa)
    _extend_stop_dates_for_new_plan_item(stop, scheduled_date)
    _extend_trip_dates_for_new_plan_item(trip, scheduled_date)
    db.commit()
    return {"id": sa.id, "message": "Activity added"}


@router.put("/{trip_id}/itinerary/reorder")
def reorder(trip_id: int, req: ReorderRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for idx, aid in enumerate(req.ordered_ids):
        a = db.query(TripStopActivity).filter(TripStopActivity.id == aid, TripStopActivity.stop_id == req.stop_id).first()
        if a:
            a.sort_order = idx
    db.commit()
    return {"message": "Reordered"}


@router.post("/{trip_id}/stops/{stop_id}/activities")
def add_activity_to_stop(
    trip_id: int, stop_id: int,
    activity_id: int = Query(...),
    scheduled_date: Optional[date] = Query(None),
    start_time: Optional[str] = Query(None),
    notes: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(404, "Stop not found")

    parsed_time = None
    if start_time:
        try:
            parsed_time = datetime.strptime(start_time, "%H:%M").time()
        except ValueError:
            pass

    target_date = scheduled_date or _get_next_plan_date(trip)

    sa = TripStopActivity(
        stop_id=stop_id, activity_id=activity_id,
        scheduled_date=target_date, start_time=parsed_time,
        notes=notes, sort_order=len(stop.activities)
    )
    db.add(sa)
    _extend_stop_dates_for_new_plan_item(stop, target_date)
    _extend_trip_dates_for_new_plan_item(trip, target_date)
    db.commit()
    db.refresh(stop)
    return {
        "activities": [{
            "id": a.id, "activity_id": a.activity_id,
            "activity_name": a.activity.name if a.activity else "",
            "notes": a.notes, "sort_order": a.sort_order
        } for a in stop.activities]
    }


@router.delete("/{trip_id}/stops/{stop_id}/activities/{activity_id}")
def delete_activity_from_stop(
    trip_id: int, stop_id: int, activity_id: int,
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    sa = db.query(TripStopActivity).filter(
        TripStopActivity.id == activity_id, TripStopActivity.stop_id == stop_id
    ).first()
    if not sa:
        raise HTTPException(404, "Activity association not found")
    db.delete(sa)
    db.commit()
    return {"message": "Activity removed from stop"}


@router.post("/{trip_id}/checklist/reset")
def reset_trip_checklist(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.checklist import PackingChecklist
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    reset_count = db.query(PackingChecklist).filter(PackingChecklist.trip_id == trip_id).update({"is_packed": False})
    db.commit()
    return {"count": reset_count, "message": "Checklist reset successfully"}


# ═══════════════════════════════════════════════════════════
#  AI Place Suggestions
# ═══════════════════════════════════════════════════════════

class SuggestPlacesRequest(BaseModel):
    destination: str
    interests: List[str] = []
    budget_tier: str = "mid"
    days: int = 3


@router.post("/{trip_id}/suggest-places")
async def suggest_places_for_trip(
    trip_id: int, req: SuggestPlacesRequest,
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """AI-powered place suggestions for a specific trip."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")
    return await suggest_places(req.destination, req.interests, req.budget_tier, req.days)


@router.post("/suggest-places")
async def suggest_places_general(req: SuggestPlacesRequest, user: User = Depends(get_current_user)):
    """AI-powered place suggestions — standalone, no trip needed."""
    return await suggest_places(req.destination, req.interests, req.budget_tier, req.days)

