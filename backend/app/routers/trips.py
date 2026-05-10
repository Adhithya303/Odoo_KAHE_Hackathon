"""Trips router — CRUD, itinerary, management."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip, TripStop
from app.models.activity import TripStopActivity, Activity
from app.schemas.trip import TripCreate, TripUpdate
from app.schemas.itinerary import GenerateItineraryRequest, TripStopActivityCreate, ReorderRequest
from app.services.trip_service import generate_itinerary, optimize_route
from typing import Optional, List
from datetime import datetime, date, timedelta

router = APIRouter(prefix="/api/trips", tags=["trips"])


def trip_to_dict(trip, include_stops=False):
    data = {
        "id": trip.id, "user_id": trip.user_id, "name": trip.name,
        "description": trip.description, "cover_photo_url": trip.cover_photo_url,
        "start_date": str(trip.start_date), "end_date": str(trip.end_date),
        "total_budget": float(trip.total_budget) if trip.total_budget else None,
        "predicted_budget": float(trip.predicted_budget) if trip.predicted_budget else None,
        "visibility": trip.visibility, "status": trip.status,
        "trip_scope": trip.trip_scope, "duration_days": trip.duration_days,
    }
    if include_stops and trip.stops:
        data["stops"] = [{
            "id": s.id, "destination_id": s.destination_id,
            "destination_name": s.destination.name if s.destination else s.custom_place,
            "arrival_date": str(s.arrival_date) if s.arrival_date else None,
            "departure_date": str(s.departure_date) if s.departure_date else None,
            "sort_order": s.sort_order,
            "latitude": float(s.latitude) if s.latitude else None,
            "longitude": float(s.longitude) if s.longitude else None,
        } for s in trip.stops]
    return data


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
    trip = Trip(user_id=user.id, name=req.name, description=req.description,
                start_date=req.start_date, end_date=req.end_date,
                total_budget=req.total_budget, trip_scope=req.trip_scope)
    db.add(trip)
    db.flush()
    if req.destination_id:
        db.add(TripStop(trip_id=trip.id, destination_id=req.destination_id,
                        arrival_date=req.start_date, departure_date=req.end_date, sort_order=0))
    db.commit()
    db.refresh(trip)
    return trip_to_dict(trip)


@router.get("/{trip_id}")
def get_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    return trip_to_dict(trip, include_stops=True)


@router.put("/{trip_id}")
def update_trip(trip_id: int, req: TripUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    
    data = req.model_dump(exclude_unset=True)
    if "add_stop" in data:
        stop_name = data.pop("add_stop")
        # Try to find destination
        from app.models.destination import Destination
        dest = db.query(Destination).filter(Destination.name.ilike(stop_name)).first()
        
        new_stop = TripStop(
            trip_id=trip.id,
            destination_id=dest.id if dest else None,
            custom_place=None if dest else stop_name,
            section_title=stop_name,
            arrival_date=trip.start_date,
            departure_date=trip.start_date,
            sort_order=len(trip.stops)
        )
        db.add(new_stop)
        
    for field, value in data.items():
        setattr(trip, field, value)
    
    db.commit(); db.refresh(trip)
    return trip_to_dict(trip, include_stops=True)


@router.delete("/{trip_id}")
def delete_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    db.delete(trip); db.commit()
    return {"message": "Trip deleted"}


@router.post("/{trip_id}/duplicate")
def duplicate_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    new = Trip(user_id=user.id, name=f"{trip.name} (Copy)", description=trip.description,
               start_date=trip.start_date, end_date=trip.end_date,
               total_budget=trip.total_budget, trip_scope=trip.trip_scope, status="planning")
    db.add(new); db.commit(); db.refresh(new)
    return trip_to_dict(new)


@router.post("/{trip_id}/copy")
def copy_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    original = db.query(Trip).filter(Trip.id == trip_id).first()
    if not original:
        raise HTTPException(404, "Original trip not found")
    
    # Calculate date offsets
    duration = (original.end_date - original.start_date).days
    new_start = date.today()
    new_end = new_start + timedelta(days=duration)
    
    new_trip = Trip(
        user_id=user.id,
        name=f"Copy of {original.name}",
        description=original.description,
        cover_photo_url=original.cover_photo_url,
        start_date=new_start,
        end_date=new_end,
        total_budget=original.total_budget,
        visibility="private",
        status="planning",
        trip_scope=original.trip_scope
    )
    db.add(new_trip)
    db.flush()
    
    # Copy stops
    for stop in original.stops:
        # Calculate stop dates based on offset from original start
        arrival_offset = (stop.arrival_date - original.start_date).days if stop.arrival_date else 0
        departure_offset = (stop.departure_date - original.start_date).days if stop.departure_date else 0
        
        new_stop = TripStop(
            trip_id=new_trip.id,
            destination_id=stop.destination_id,
            custom_place=stop.custom_place,
            section_title=stop.section_title,
            description=stop.description,
            arrival_date=new_start + timedelta(days=arrival_offset) if stop.arrival_date else None,
            departure_date=new_start + timedelta(days=departure_offset) if stop.departure_date else None,
            sort_order=stop.sort_order,
            stop_budget=stop.stop_budget,
            latitude=stop.latitude,
            longitude=stop.longitude
        )
        db.add(new_stop)
        db.flush()
        
        # Copy activities
        for sa in stop.activities:
            new_sa = TripStopActivity(
                stop_id=new_stop.id,
                activity_id=sa.activity_id,
                scheduled_date=new_start + timedelta(days=(sa.scheduled_date - original.start_date).days) if sa.scheduled_date else None,
                start_time=sa.start_time,
                end_time=sa.end_time,
                actual_cost=sa.actual_cost,
                notes=sa.notes,
                sort_order=sa.sort_order
            )
            db.add(new_sa)
            
    db.commit()
    db.refresh(new_trip)
    return trip_to_dict(new_trip, include_stops=True)


@router.get("/{trip_id}/itinerary")
def get_itinerary(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).order_by(TripStop.sort_order).all()
    result = []
    for stop in stops:
        acts = db.query(TripStopActivity).filter(TripStopActivity.stop_id == stop.id).order_by(TripStopActivity.sort_order).all()
        result.append({
            "stop": {"id": stop.id, "destination_id": stop.destination_id,
                     "section_title": stop.section_title, "sort_order": stop.sort_order},
            "activities": [{
                "id": a.id, "activity_id": a.activity_id,
                "activity_name": a.activity.name if a.activity else "",
                "activity_description": a.activity.description if a.activity else "",
                "notes": a.notes, "sort_order": a.sort_order,
                "estimated_cost": float(a.activity.estimated_cost) if a.activity and a.activity.estimated_cost else 0,
                "duration_hours": float(a.activity.duration_hours) if a.activity and a.activity.duration_hours else 1,
            } for a in acts],
        })
    return {"itinerary": result}


@router.post("/{trip_id}/itinerary/generate")
async def gen_itinerary(trip_id: int, req: GenerateItineraryRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    return await generate_itinerary(db, trip, req.interests, req.hotel_type)


@router.post("/{trip_id}/itinerary/activities")
def add_activity(trip_id: int, req: TripStopActivityCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    if req.activity_name and not req.activity_id:
        act = Activity(name=req.activity_name, description=req.activity_description, source="manual")
        db.add(act); db.flush()
        activity_id = act.id
    else:
        activity_id = req.activity_id
    stop = db.query(TripStop).filter(TripStop.trip_id == trip_id).first()
    if not stop: raise HTTPException(400, "No stops found")
    sa = TripStopActivity(stop_id=stop.id, activity_id=activity_id, scheduled_date=req.scheduled_date, notes=req.notes, sort_order=0)
    db.add(sa); db.commit()
    return {"id": sa.id, "message": "Activity added"}


@router.put("/{trip_id}/itinerary/reorder")
def reorder(trip_id: int, req: ReorderRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for idx, aid in enumerate(req.ordered_ids):
        a = db.query(TripStopActivity).filter(TripStopActivity.id == aid, TripStopActivity.stop_id == req.stop_id).first()
        if a: a.sort_order = idx
    db.commit()
    return {"message": "Reordered"}


@router.post("/{trip_id}/stops/{stop_id}/activities")
def add_activity_to_stop(
    trip_id: int, 
    stop_id: int, 
    activity_id: int = Query(...), 
    scheduled_date: Optional[date] = Query(None),
    start_time: Optional[str] = Query(None),
    notes: Optional[str] = Query(None),
    user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop: raise HTTPException(404, "Stop not found")
    
    # Parse start_time if provided
    parsed_time = None
    if start_time:
        try:
            parsed_time = datetime.strptime(start_time, "%H:%M").time()
        except ValueError:
            pass

    sa = TripStopActivity(
        stop_id=stop_id, 
        activity_id=activity_id, 
        scheduled_date=scheduled_date, 
        start_time=parsed_time,
        notes=notes, 
        sort_order=len(stop.activities)
    )
    db.add(sa)
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
    trip_id: int, 
    stop_id: int, 
    activity_id: int, 
    user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    
    sa = db.query(TripStopActivity).filter(
        TripStopActivity.id == activity_id, 
        TripStopActivity.stop_id == stop_id
    ).first()
    if not sa: raise HTTPException(404, "Activity association not found")
    
    db.delete(sa)
    db.commit()
    return {"message": "Activity removed from stop"}


@router.post("/{trip_id}/checklist/reset")
def reset_trip_checklist(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.checklist import PackingChecklist
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    
    reset_count = db.query(PackingChecklist).filter(PackingChecklist.trip_id == trip_id).update({"is_packed": False})
    db.commit()
    return {"count": reset_count, "message": "Checklist reset successfully"}
