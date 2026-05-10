"""Itinerary Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time


class ActivityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    estimated_cost: Optional[float] = None
    duration_hours: Optional[float] = None
    image_url: Optional[str] = None


class TripStopActivityCreate(BaseModel):
    activity_id: Optional[int] = None
    activity_name: Optional[str] = None
    activity_description: Optional[str] = None
    scheduled_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    actual_cost: Optional[float] = None
    notes: Optional[str] = None


class TripStopActivityResponse(BaseModel):
    id: int
    stop_id: int
    activity_id: int
    scheduled_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    actual_cost: Optional[float] = None
    notes: Optional[str] = None
    sort_order: int
    activity_name: Optional[str] = None
    activity_description: Optional[str] = None

    class Config:
        from_attributes = True


class GenerateItineraryRequest(BaseModel):
    interests: List[str] = []
    hotel_type: str = "mid"


class ReorderRequest(BaseModel):
    stop_id: int
    ordered_ids: List[int]


class OptimizeRouteRequest(BaseModel):
    stop_id: int


# ── Schemas for saving a full itinerary from the builder ──

class ItineraryActivitySave(BaseModel):
    name: str
    time: Optional[str] = "10:00"
    cost: Optional[float] = 0
    category: Optional[str] = "Sightseeing"
    description: Optional[str] = None


class ItinerarySectionSave(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget_allocated: Optional[float] = 0
    activities: List[ItineraryActivitySave] = []


class ItinerarySaveRequest(BaseModel):
    sections: List[ItinerarySectionSave]
