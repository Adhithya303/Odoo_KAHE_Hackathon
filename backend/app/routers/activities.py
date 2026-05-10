from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.activity import Activity
from app.models.destination import Destination, TripType
from app.schemas.activity import ActivitySearchResponse, ActivityBrief
from typing import Optional

router = APIRouter(prefix="/api/activities", tags=["activities"])

@router.get("", response_model=ActivitySearchResponse)
def search_activities(
    destination_id: Optional[int] = None,
    trip_type_id: Optional[int] = None,
    max_cost: Optional[float] = None,
    min_cost: Optional[float] = None,
    max_duration_hours: Optional[float] = None,
    q: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Activity).join(Destination, isouter=True).join(TripType, isouter=True)
    
    if destination_id:
        query = query.filter(Activity.destination_id == destination_id)
    if trip_type_id:
        query = query.filter(Activity.trip_type_id == trip_type_id)
    if max_cost is not None:
        query = query.filter(Activity.estimated_cost <= max_cost)
    if min_cost is not None:
        query = query.filter(Activity.estimated_cost >= min_cost)
    if max_duration_hours is not None:
        query = query.filter(Activity.duration_hours <= max_duration_hours)
    if q:
        query = query.filter(or_(
            Activity.name.ilike(f"%{q}%"),
            Activity.description.ilike(f"%{q}%")
        ))
    
    total = query.count()
    activities = query.offset(offset).limit(limit).all()
    
    results = []
    for a in activities:
        results.append(ActivityBrief(
            id=a.id,
            name=a.name,
            description=a.description,
            image_url=a.image_url,
            estimated_cost=float(a.estimated_cost) if a.estimated_cost else 0,
            duration_hours=float(a.duration_hours) if a.duration_hours else 0,
            destination_name=a.destination.name if a.destination else None,
            trip_type_name=a.trip_type.name if a.trip_type else None
        ))
    
    return ActivitySearchResponse(total=total, activities=results)
