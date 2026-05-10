"""Public Itinerary Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class PublicActivityResponse(BaseModel):
    name: str
    description: Optional[str] = None
    cost: Optional[float] = None
    duration: Optional[float] = None


class PublicStopResponse(BaseModel):
    destination_name: Optional[str] = None
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    activities: List[PublicActivityResponse]


class PublicTripResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    total_budget: Optional[float] = None
    stops: List[PublicStopResponse]

    class Config:
        from_attributes = True
