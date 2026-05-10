"""Activity Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ActivityBrief(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    estimated_cost: Optional[float] = None
    duration_hours: Optional[float] = None
    destination_name: Optional[str] = None
    trip_type_name: Optional[str] = None

    class Config:
        from_attributes = True


class ActivitySearchResponse(BaseModel):
    total: int
    activities: List[ActivityBrief]
