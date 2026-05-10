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
from typing import Optional

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
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit(); db.refresh(trip)
    return trip_to_dict(trip)


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
