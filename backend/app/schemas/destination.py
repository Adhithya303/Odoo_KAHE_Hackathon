"""Destination Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List


class DestinationBrief(BaseModel):
    id: int
    name: str
    country: Optional[str] = None
    city: Optional[str] = None
    trip_scope: str
    cover_image_url: Optional[str] = None
    cost_index: Optional[str] = None
    popularity_score: Optional[int] = None
    avg_min_budget: Optional[int] = None
    avg_max_budget: Optional[int] = None
    vibe_tags: Optional[str] = None
    climate_tags: Optional[str] = None
    trip_types: List[str] = []
    group_types: List[str] = []

    class Config:
        from_attributes = True


class DestinationDetail(DestinationBrief):
    description: Optional[str] = None
    travel_months: List[str] = []

    class Config:
        from_attributes = True


class DestinationSearchRequest(BaseModel):
    query: str


class DestinationFilterParams(BaseModel):
    vibes: Optional[List[str]] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    scope: Optional[str] = None
    season: Optional[str] = None
    crowd_level: Optional[str] = None
    trip_types: Optional[List[str]] = None
    page: int = 1
    per_page: int = 20
