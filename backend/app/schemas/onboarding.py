"""Post-signup onboarding recommendations schema."""
from pydantic import BaseModel
from typing import Optional, List


class DestinationCard(BaseModel):
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
    trip_types: List[str] = []

    class Config:
        from_attributes = True


class OnboardingRecommendationsResponse(BaseModel):
    top_5_picks: List[DestinationCard]
    by_trip_type: dict  # {trip_type: [DestinationCard]}
    by_scope: dict  # {scope: [DestinationCard]}
    other_trending: List[DestinationCard]
