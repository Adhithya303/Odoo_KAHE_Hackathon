"""Recommendation service — ML-powered destination recommendations."""
from sqlalchemy.orm import Session
from sqlalchemy import case, func
from app.models.destination import Destination, RecommendationProfile
from app.models.preference import UserPreference
from app.models.user import User
from typing import List, Optional
import httpx
from app.config import settings
import json


def _normalize_country(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalized = value.strip().lower()
    return normalized or None


async def get_recommendations_for_user(db: Session, user_id: int, limit: int = 10) -> List[dict]:
    """Get personalized recommendations based on user preferences."""
    user = db.query(User).filter(User.id == user_id).first()
    user_country = _normalize_country(user.country) if user else None

    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not pref:
        return await get_trending_destinations(db, limit, user_country=user_country)

    # Build preference text for ML embedding
    trip_types = [t.name for t in pref.trip_types] if pref.trip_types else []
    group_types = [g.name for g in pref.group_types] if pref.group_types else []

    query_parts = []
    if trip_types:
        query_parts.append(f"I like {', '.join(trip_types)} trips")
    if group_types:
        query_parts.append(f"traveling {', '.join(group_types).lower()}")
    if pref.trip_scope and pref.trip_scope != "Both":
        query_parts.append(f"{pref.trip_scope.lower()} destinations")
    if pref.min_budget and pref.max_budget:
        query_parts.append(f"budget ₹{pref.min_budget} to ₹{pref.max_budget}")
    if user_country:
        query_parts.append(f"in or near {user_country.title()}")

    query_text = ", ".join(query_parts) if query_parts else "popular travel destinations"

    # Try ML service first
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.ML_SERVICE_URL}/recommend",
                json={"query": query_text, "limit": limit}
            )
            if resp.status_code == 200:
                dest_names = resp.json().get("destinations", [])
                results = []
                for name in dest_names:
                    dest = db.query(Destination).filter(Destination.name == name).first()
                    if dest:
                        results.append(destination_to_dict(dest))
                if results:
                    if user_country:
                        results.sort(
                            key=lambda d: (
                                0 if _normalize_country(d.get("country")) == user_country else 1,
                                -(d.get("popularity_score") or 0),
                            )
                        )
                    return results
    except Exception:
        pass

    # Fallback: filter from database directly
    return await get_filtered_recommendations(db, pref, limit, user_country=user_country)


async def get_filtered_recommendations(
    db: Session,
    pref: UserPreference,
    limit: int,
    user_country: Optional[str] = None,
) -> List[dict]:
    """Fallback recommendations using database filtering."""
    query = db.query(Destination)

    if pref.trip_scope and pref.trip_scope != "Both":
        query = query.filter(Destination.trip_scope == pref.trip_scope)

    if pref.min_budget:
        query = query.filter(Destination.avg_min_budget >= pref.min_budget * 0.5)
    if pref.max_budget:
        query = query.filter(Destination.avg_max_budget <= pref.max_budget * 1.5)

    if user_country:
        country_match_order = case(
            (func.lower(Destination.country) == user_country, 0),
            else_=1,
        )
        destinations = query.order_by(country_match_order, Destination.popularity_score.desc()).limit(limit).all()
    else:
        destinations = query.order_by(Destination.popularity_score.desc()).limit(limit).all()

    return [destination_to_dict(d) for d in destinations]


async def search_by_query(db: Session, query: str, limit: int = 10) -> List[dict]:
    """Semantic search using ML service, with DB fallback."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.ML_SERVICE_URL}/recommend",
                json={"query": query, "limit": limit}
            )
            if resp.status_code == 200:
                dest_names = resp.json().get("destinations", [])
                results = []
                for name in dest_names:
                    dest = db.query(Destination).filter(Destination.name == name).first()
                    if dest:
                        results.append(destination_to_dict(dest))
                if results:
                    return results
    except Exception:
        pass

    # Fallback: basic text search
    destinations = db.query(Destination).filter(
        Destination.name.ilike(f"%{query}%") |
        Destination.vibe_tags.ilike(f"%{query}%") |
        Destination.description.ilike(f"%{query}%")
    ).limit(limit).all()
    return [destination_to_dict(d) for d in destinations]


async def get_trending_destinations(db: Session, limit: int = 10, user_country: Optional[str] = None) -> List[dict]:
    """Get trending destinations by popularity score."""
    query = db.query(Destination)
    if user_country:
        country_match_order = case(
            (func.lower(Destination.country) == user_country, 0),
            else_=1,
        )
        query = query.order_by(country_match_order, Destination.popularity_score.desc())
    else:
        query = query.order_by(Destination.popularity_score.desc())

    destinations = query.limit(limit).all()
    return [destination_to_dict(d) for d in destinations]


def destination_to_dict(dest: Destination) -> dict:
    """Convert destination ORM object to dict."""
    return {
        "id": dest.id,
        "name": dest.name,
        "country": dest.country,
        "city": dest.city,
        "trip_scope": dest.trip_scope,
        "description": dest.description,
        "cover_image_url": dest.cover_image_url,
        "cost_index": dest.cost_index,
        "popularity_score": dest.popularity_score,
        "avg_min_budget": dest.avg_min_budget,
        "avg_max_budget": dest.avg_max_budget,
        "vibe_tags": dest.vibe_tags,
        "climate_tags": dest.climate_tags,
        "trip_types": [t.name for t in dest.trip_types] if dest.trip_types else [],
        "group_types": [g.name for g in dest.group_types] if dest.group_types else [],
        "travel_months": [m.name for m in dest.travel_months] if dest.travel_months else [],
    }
