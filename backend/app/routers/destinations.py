"""Destinations router — list, detail, search, filter, trending."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.destination import Destination
from app.services.recommendation_service import destination_to_dict
from typing import Optional, List

router = APIRouter(prefix="/api/destinations", tags=["destinations"])


@router.get("")
def list_destinations(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Destination)
    if scope:
        query = query.filter(Destination.trip_scope == scope)

    total = query.count()
    destinations = query.order_by(Destination.popularity_score.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return {
        "destinations": [destination_to_dict(d) for d in destinations],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/trending")
def trending(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    destinations = db.query(Destination).order_by(
        Destination.popularity_score.desc()
    ).limit(limit).all()
    return {"destinations": [destination_to_dict(d) for d in destinations]}


@router.get("/search")
def search_destinations(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    destinations = db.query(Destination).filter(
        Destination.name.ilike(f"%{q}%") |
        Destination.vibe_tags.ilike(f"%{q}%") |
        Destination.climate_tags.ilike(f"%{q}%") |
        Destination.country.ilike(f"%{q}%")
    ).limit(20).all()
    return {"destinations": [destination_to_dict(d) for d in destinations]}


@router.get("/filter")
def filter_destinations(
    vibes: Optional[str] = None,
    budget_min: Optional[int] = None,
    budget_max: Optional[int] = None,
    scope: Optional[str] = None,
    cost_index: Optional[str] = None,
    trip_types: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Destination)

    if scope:
        query = query.filter(Destination.trip_scope == scope)
    if cost_index:
        query = query.filter(Destination.cost_index == cost_index)
    if budget_min:
        query = query.filter(Destination.avg_min_budget >= budget_min)
    if budget_max:
        query = query.filter(Destination.avg_max_budget <= budget_max)
    if vibes:
        for vibe in vibes.split(","):
            query = query.filter(Destination.vibe_tags.ilike(f"%{vibe.strip()}%"))

    total = query.count()
    destinations = query.order_by(Destination.popularity_score.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return {
        "destinations": [destination_to_dict(d) for d in destinations],
        "total": total,
        "page": page,
    }


@router.get("/{dest_id}")
def get_destination(dest_id: int, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return destination_to_dict(dest)
