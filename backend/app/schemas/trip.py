"""Trip Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class TripCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: date
    end_date: date
    total_budget: Optional[float] = None
    trip_scope: str = "Domestic"
    destination_id: Optional[int] = None


class TripUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_budget: Optional[float] = None
    status: Optional[str] = None
    visibility: Optional[str] = None
    cover_photo_url: Optional[str] = None


class TripResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    cover_photo_url: Optional[str] = None
    start_date: date
    end_date: date
    total_budget: Optional[float] = None
    predicted_budget: Optional[float] = None
    visibility: str
    status: str
    trip_scope: Optional[str] = None
    duration_days: int = 0

    class Config:
        from_attributes = True


class TripStopCreate(BaseModel):
    destination_id: Optional[int] = None
    custom_place: Optional[str] = None
    section_title: Optional[str] = None
    description: Optional[str] = None
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    stop_budget: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class TripStopResponse(BaseModel):
    id: int
    trip_id: int
    destination_id: Optional[int] = None
    custom_place: Optional[str] = None
    section_title: Optional[str] = None
    description: Optional[str] = None
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    sort_order: int
    stop_budget: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True
