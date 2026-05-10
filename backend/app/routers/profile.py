from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.community import SavedTrip
from typing import List

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/saved-trips")
def get_saved_trips(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedTrip).filter(SavedTrip.user_id == user.id).all()
    trip_ids = [s.trip_id for s in saved]
    trips = db.query(Trip).filter(Trip.id.in_(trip_ids)).all()
    
    # We can reuse the trip_to_dict if we import it, but for now let's just return basic info
    # or import it from trips router. Let's just return a list.
    return {
        "trips": [{
            "id": t.id,
            "name": t.name,
            "start_date": str(t.start_date),
            "end_date": str(t.end_date),
            "cover_photo_url": t.cover_photo_url,
            "destination_count": len(t.stops)
        } for t in trips]
    }

@router.post("/saved-trips/{trip_id}")
def save_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if trip exists and is public
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.visibility != "public" and trip.user_id != user.id:
        raise HTTPException(status_code=403, detail="Cannot save private trip")
        
    # Check if already saved
    existing = db.query(SavedTrip).filter(SavedTrip.user_id == user.id, SavedTrip.trip_id == trip_id).first()
    if existing:
        return {"message": "Trip already saved"}
        
    saved = SavedTrip(user_id=user.id, trip_id=trip_id)
    db.add(saved)
    db.commit()
    return {"message": "Trip saved successfully"}

@router.delete("/saved-trips/{trip_id}")
def unsave_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedTrip).filter(SavedTrip.user_id == user.id, SavedTrip.trip_id == trip_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved trip not found")
        
    db.delete(saved)
    db.commit()
    return {"message": "Trip removed from saved"}
