from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.schemas.public import PublicTripResponse, PublicStopResponse, PublicActivityResponse

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/trips/{trip_id}", response_model=PublicTripResponse)
def get_public_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.visibility == "public").first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or not public")
    
    stops = []
    for stop in trip.stops:
        activities = []
        for stop_activity in stop.activities:
            activities.append(PublicActivityResponse(
                name=stop_activity.activity.name if stop_activity.activity else "Unknown Activity",
                description=stop_activity.activity.description if stop_activity.activity else None,
                cost=float(stop_activity.actual_cost) if stop_activity.actual_cost else (float(stop_activity.activity.estimated_cost) if stop_activity.activity and stop_activity.activity.estimated_cost else 0),
                duration=float(stop_activity.activity.duration_hours) if stop_activity.activity and stop_activity.activity.duration_hours else 0
            ))
        
        stops.append(PublicStopResponse(
            destination_name=stop.destination.name if stop.destination else stop.custom_place,
            arrival_date=stop.arrival_date,
            departure_date=stop.departure_date,
            activities=activities
        ))
    
    return PublicTripResponse(
        id=trip.id,
        name=trip.name,
        description=trip.description,
        start_date=trip.start_date,
        end_date=trip.end_date,
        total_budget=float(trip.total_budget) if trip.total_budget else 0,
        stops=stops
    )
