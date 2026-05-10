"""Recommendations router — personalized and query-based."""
from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.recommendation_service import (
    get_recommendations_for_user, search_by_query, get_trending_destinations,
)
from app.config import settings
from app.models.destination import Destination
from app.services.recommendation_service import destination_to_dict
from app.schemas.onboarding import OnboardingRecommendationsResponse, DestinationCard
from pydantic import BaseModel, Field
import httpx

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/for-me")
async def for_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = await get_recommendations_for_user(db, user.id)
    return {"destinations": results}


class QueryRequest(BaseModel):
    query: str


class HomeScreenRequest(BaseModel):
    trip_scope: str = Field(..., examples=["Domestic", "International"])
    trip_types: list[str] = Field(default_factory=list)
    min_budget: float
    max_budget: float
    top_n: int = 10


@router.post("/by-query")
async def by_query(req: QueryRequest, db: Session = Depends(get_db)):
    results = await search_by_query(db, req.query)
    return {"destinations": results}


@router.post("/home-screen")
async def home_screen(req: HomeScreenRequest, db: Session = Depends(get_db)):
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{settings.ML_SERVICE_URL}/recommend-home-screen",
                json=req.model_dump(),
            )
            response.raise_for_status()
            return response.json()
    except Exception:
        query = db.query(Destination)

        if req.trip_scope:
            query = query.filter(Destination.trip_scope == req.trip_scope)

        if req.min_budget:
            query = query.filter(Destination.avg_min_budget >= req.min_budget * 0.5)
        if req.max_budget:
            query = query.filter(Destination.avg_max_budget <= req.max_budget * 1.5)

        for trip_type in req.trip_types:
            query = query.filter(Destination.vibe_tags.ilike(f"%{trip_type}%") | Destination.trip_scope.ilike(f"%{trip_type}%"))

        destinations = query.order_by(Destination.popularity_score.desc()).limit(req.top_n).all()
        return {"destinations": [destination_to_dict(dest) for dest in destinations]}


@router.get("/onboarding", response_model=OnboardingRecommendationsResponse)
async def get_onboarding_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Post-signup onboarding: returns organized recommendations by preference, trip type, scope, and trending."""
    from app.models.preference import UserPreference
    from app.models.destination import TripType

    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    normalized_country = user.country.strip().lower() if user.country else None

    def apply_country_priority(query):
        if not normalized_country:
            return query.order_by(Destination.popularity_score.desc())
        country_match_order = case(
            (func.lower(Destination.country) == normalized_country, 0),
            else_=1,
        )
        return query.order_by(country_match_order, Destination.popularity_score.desc())

    # 1. Top 5 personalized picks using ML service
    top_5_picks = []
    if pref:
        try:
            trip_types = [t.name for t in pref.trip_types] if pref.trip_types else []
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{settings.ML_SERVICE_URL}/recommend-home-screen",
                    json={
                        "trip_scope": pref.trip_scope or "Domestic",
                        "trip_types": trip_types,
                        "min_budget": pref.min_budget or 5000,
                        "max_budget": pref.max_budget or 500000,
                        "top_n": 5,
                    },
                )
                if response.status_code == 200:
                    destinations = response.json().get("destinations", [])
                    for item in destinations:
                        dest = db.query(Destination).filter(Destination.name == item["destination"]).first()
                        if dest:
                            top_5_picks.append(dest)
        except Exception:
            pass

    if not top_5_picks:
        top_5_picks = apply_country_priority(db.query(Destination)).limit(5).all()

    # 2. Destinations by trip type
    by_trip_type = {}
    if pref and pref.trip_types:
        for trip_type in pref.trip_types:
            dests = db.query(Destination).join(
                Destination.trip_types
            ).filter(TripType.name == trip_type.name).limit(5).all()
            if dests:
                by_trip_type[trip_type.name] = dests
    else:
        all_types = db.query(TripType).limit(3).all()
        for trip_type in all_types:
            dests = db.query(Destination).join(
                Destination.trip_types
            ).filter(TripType.name == trip_type.name).limit(5).all()
            if dests:
                by_trip_type[trip_type.name] = dests

    # 3. Destinations by scope
    by_scope = {}
    for scope in ["Domestic", "International"]:
        dests = apply_country_priority(
            db.query(Destination).filter(Destination.trip_scope == scope)
        ).limit(5).all()
        if dests:
            by_scope[scope] = dests

    # 4. Other trending destinations (excluding already shown)
    shown_ids = {d.id for d in top_5_picks}
    for dests in by_trip_type.values():
        shown_ids.update(d.id for d in dests)
    for dests in by_scope.values():
        shown_ids.update(d.id for d in dests)

    other_trending = apply_country_priority(
        db.query(Destination).filter(~Destination.id.in_(shown_ids))
    ).limit(10).all()

    # Convert to response
    return OnboardingRecommendationsResponse(
        top_5_picks=[DestinationCard.model_validate(d) for d in top_5_picks],
        by_trip_type={
            k: [DestinationCard.model_validate(d) for d in v]
            for k, v in by_trip_type.items()
        },
        by_scope={
            k: [DestinationCard.model_validate(d) for d in v]
            for k, v in by_scope.items()
        },
        other_trending=[DestinationCard.model_validate(d) for d in other_trending],
    )
