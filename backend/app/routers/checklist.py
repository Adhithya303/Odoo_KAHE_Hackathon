"""Packing Checklist router — CRUD + AI-powered item suggestions."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.checklist import PackingChecklist, ChecklistCategory

router = APIRouter(prefix="/api/checklist", tags=["checklist"])

CATEGORY_ORDER = ["Documents", "Clothing", "Electronics", "Toiletries", "Miscellaneous"]


def _get_or_create_category(db: Session, name: str) -> ChecklistCategory:
    cat = db.query(ChecklistCategory).filter(
        func.lower(ChecklistCategory.name) == name.lower()
    ).first()
    if not cat:
        cat = ChecklistCategory(name=name.capitalize())
        db.add(cat)
        db.flush()
    return cat


def _item_dict(item: PackingChecklist) -> dict:
    return {
        "id": item.id,
        "trip_id": item.trip_id,
        "item_name": item.item_name,
        "category": item.category.name if item.category else "Miscellaneous",
        "is_packed": item.is_packed,
        "ai_suggested": item.is_ai_suggested,
        "sort_order": item.sort_order,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


def _build_progress(items):
    total = len(items)
    packed = sum(1 for i in items if i.is_packed)
    return {
        "packed": packed,
        "total": total,
        "percentage": round((packed / total * 100) if total else 0),
    }


class AddItemRequest(BaseModel):
    item_name: str
    category: Optional[str] = "Miscellaneous"
    ai_suggested: Optional[bool] = False


class UpdateItemRequest(BaseModel):
    is_packed: Optional[bool] = None
    item_name: Optional[str] = None
    category: Optional[str] = None


@router.get("/{trip_id}")
def get_checklist(
    trip_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    items = (
        db.query(PackingChecklist)
        .filter(PackingChecklist.trip_id == trip_id)
        .order_by(PackingChecklist.sort_order, PackingChecklist.id)
        .all()
    )

    return {
        "items": [_item_dict(i) for i in items],
        "categories": CATEGORY_ORDER,
        "progress": _build_progress(items),
    }


@router.post("/{trip_id}")
def add_item(
    trip_id: int,
    req: AddItemRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    cat = _get_or_create_category(db, req.category or "Miscellaneous")

    # Max sort order in this trip
    max_order = (
        db.query(func.max(PackingChecklist.sort_order))
        .filter(PackingChecklist.trip_id == trip_id)
        .scalar()
        or 0
    )

    item = PackingChecklist(
        trip_id=trip_id,
        category_id=cat.id,
        item_name=req.item_name,
        is_packed=False,
        is_ai_suggested=req.ai_suggested or False,
        sort_order=max_order + 1,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _item_dict(item)


@router.patch("/{trip_id}/items/{item_id}")
def update_item(
    trip_id: int,
    item_id: int,
    req: UpdateItemRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    item = db.query(PackingChecklist).filter(
        PackingChecklist.id == item_id, PackingChecklist.trip_id == trip_id
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")

    if req.is_packed is not None:
        item.is_packed = req.is_packed
    if req.item_name is not None:
        item.item_name = req.item_name
    if req.category is not None:
        cat = _get_or_create_category(db, req.category)
        item.category_id = cat.id

    db.commit()
    db.refresh(item)
    return _item_dict(item)


@router.delete("/{trip_id}/items/{item_id}")
def delete_item(
    trip_id: int,
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    item = db.query(PackingChecklist).filter(
        PackingChecklist.id == item_id, PackingChecklist.trip_id == trip_id
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")

    db.delete(item)
    db.commit()
    return {"deleted": True}


@router.delete("/{trip_id}/reset")
def reset_checklist(
    trip_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    db.query(PackingChecklist).filter(PackingChecklist.trip_id == trip_id).update(
        {"is_packed": False}
    )
    db.commit()

    items = db.query(PackingChecklist).filter(PackingChecklist.trip_id == trip_id).all()
    return {"progress": _build_progress(items)}


@router.post("/{trip_id}/ai-suggest")
async def ai_suggest(
    trip_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    # Build context
    destination = "the destination"
    if trip.stops:
        first_stop = trip.stops[0]
        destination = (
            first_stop.destination.name
            if first_stop.destination
            else first_stop.custom_place or destination
        )

    duration = trip.duration_days
    start_date = str(trip.start_date)
    end_date = str(trip.end_date)
    trip_scope = trip.trip_scope or "Domestic"

    # Climate hint from destination
    climate_hint = "moderate"
    if trip.stops and trip.stops[0].destination:
        climate_hint = trip.stops[0].destination.climate_tags or "moderate"

    prompt = (
        f"Generate a packing checklist for a trip to {destination} "
        f"from {start_date} to {end_date} ({duration} days). "
        f"Trip type: {trip_scope}. Climate: {climate_hint}. "
        f"Return a JSON array where each item has: "
        f"{{\"item_name\": string, \"category\": one of "
        f"[\"Documents\",\"Clothing\",\"Electronics\",\"Toiletries\",\"Miscellaneous\"]}}. "
        f"Generate 20-30 items covering all categories. Return ONLY the JSON array, "
        f"no markdown, no preamble."
    )

    ai_items = []
    try:
        from app.config import settings
        import google.generativeai as genai
        import json

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip possible markdown code fences
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()

        ai_items = json.loads(text)
    except Exception:
        # Fallback hardcoded items when AI unavailable
        ai_items = [
            {"item_name": "Passport / ID", "category": "Documents"},
            {"item_name": "Travel insurance", "category": "Documents"},
            {"item_name": "Flight tickets printout", "category": "Documents"},
            {"item_name": "Hotel booking confirmation", "category": "Documents"},
            {"item_name": "T-Shirts (x5)", "category": "Clothing"},
            {"item_name": "Jeans / trousers (x2)", "category": "Clothing"},
            {"item_name": "Comfortable walking shoes", "category": "Clothing"},
            {"item_name": "Rain jacket / windcheater", "category": "Clothing"},
            {"item_name": "Underwear & socks (x7)", "category": "Clothing"},
            {"item_name": "Phone charger", "category": "Electronics"},
            {"item_name": "Power bank", "category": "Electronics"},
            {"item_name": "Universal travel adaptor", "category": "Electronics"},
            {"item_name": "Earphones / headphones", "category": "Electronics"},
            {"item_name": "Toothbrush & toothpaste", "category": "Toiletries"},
            {"item_name": "Shampoo & conditioner", "category": "Toiletries"},
            {"item_name": "Sunscreen SPF 50", "category": "Toiletries"},
            {"item_name": "Deodorant", "category": "Toiletries"},
            {"item_name": "First aid kit", "category": "Miscellaneous"},
            {"item_name": "Reusable water bottle", "category": "Miscellaneous"},
            {"item_name": "Snacks for journey", "category": "Miscellaneous"},
        ]

    # Get existing item names for duplicate check
    existing = db.query(PackingChecklist).filter(PackingChecklist.trip_id == trip_id).all()
    existing_names = {i.item_name.lower() for i in existing}

    max_order = (
        db.query(func.max(PackingChecklist.sort_order))
        .filter(PackingChecklist.trip_id == trip_id)
        .scalar()
        or 0
    )

    added = 0
    for ai_item in ai_items:
        name = ai_item.get("item_name", "").strip()
        category = ai_item.get("category", "Miscellaneous")

        if not name or name.lower() in existing_names:
            continue

        cat = _get_or_create_category(db, category)
        max_order += 1
        item = PackingChecklist(
            trip_id=trip_id,
            category_id=cat.id,
            item_name=name,
            is_packed=False,
            is_ai_suggested=True,
            sort_order=max_order,
        )
        db.add(item)
        existing_names.add(name.lower())
        added += 1

    db.commit()

    # Return full updated list
    all_items = (
        db.query(PackingChecklist)
        .filter(PackingChecklist.trip_id == trip_id)
        .order_by(PackingChecklist.sort_order)
        .all()
    )

    return {
        "added": added,
        "items": [_item_dict(i) for i in all_items],
    }
