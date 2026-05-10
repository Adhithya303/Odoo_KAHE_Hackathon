"""Trip Notes / Journal router."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.notes import TripNote

router = APIRouter(prefix="/api/notes", tags=["notes"])


def _note_dict(note: TripNote) -> dict:
    return {
        "id": note.id,
        "trip_id": note.trip_id,
        "user_id": note.user_id,
        "title": note.title,
        "content": note.content,
        "note_type": note.note_type,
        "day_number": note.day_number,
        "stop_tag": note.stop_tag,
        "is_pinned": note.is_pinned,
        "created_at": note.created_at.isoformat() if note.created_at else None,
        "updated_at": note.updated_at.isoformat() if note.updated_at else None,
    }


class NoteCreateRequest(BaseModel):
    title: str
    content: str
    note_type: Optional[str] = "general"
    day_number: Optional[int] = None
    stop_tag: Optional[str] = None
    is_pinned: Optional[bool] = False


class NoteUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    note_type: Optional[str] = None
    day_number: Optional[int] = None
    stop_tag: Optional[str] = None
    is_pinned: Optional[bool] = None


@router.get("/{trip_id}")
def get_notes(
    trip_id: int,
    view: Optional[str] = Query(default="all"),
    day: Optional[int] = Query(default=None),
    stop: Optional[str] = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    query = db.query(TripNote).filter(
        TripNote.trip_id == trip_id, TripNote.user_id == user.id
    )

    if view == "by_day" and day is not None:
        query = query.filter(TripNote.day_number == day)
    elif view == "by_stop" and stop:
        query = query.filter(TripNote.stop_tag == stop)

    notes = query.order_by(
        TripNote.is_pinned.desc(), TripNote.updated_at.desc()
    ).all()

    # Group by day
    by_day: dict = {}
    by_stop: dict = {}
    for n in notes:
        if n.day_number is not None:
            key = str(n.day_number)
            by_day.setdefault(key, []).append(_note_dict(n))
        if n.stop_tag:
            by_stop.setdefault(n.stop_tag, []).append(_note_dict(n))

    return {
        "notes": [_note_dict(n) for n in notes],
        "by_day": by_day,
        "by_stop": by_stop,
    }


@router.post("/{trip_id}")
def create_note(
    trip_id: int,
    req: NoteCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found")

    note = TripNote(
        trip_id=trip_id,
        user_id=user.id,
        title=req.title,
        content=req.content,
        note_type=req.note_type or "general",
        day_number=req.day_number,
        stop_tag=req.stop_tag,
        is_pinned=req.is_pinned or False,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return _note_dict(note)


@router.put("/{trip_id}/{note_id}")
def update_note(
    trip_id: int,
    note_id: int,
    req: NoteUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = db.query(TripNote).filter(
        TripNote.id == note_id,
        TripNote.trip_id == trip_id,
        TripNote.user_id == user.id,
    ).first()
    if not note:
        raise HTTPException(404, "Note not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    note.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(note)
    return _note_dict(note)


@router.delete("/{trip_id}/{note_id}")
def delete_note(
    trip_id: int,
    note_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = db.query(TripNote).filter(
        TripNote.id == note_id,
        TripNote.trip_id == trip_id,
        TripNote.user_id == user.id,
    ).first()
    if not note:
        raise HTTPException(404, "Note not found")

    db.delete(note)
    db.commit()
    return {"deleted": True}


@router.patch("/{trip_id}/{note_id}/pin")
def toggle_pin(
    trip_id: int,
    note_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = db.query(TripNote).filter(
        TripNote.id == note_id,
        TripNote.trip_id == trip_id,
        TripNote.user_id == user.id,
    ).first()
    if not note:
        raise HTTPException(404, "Note not found")

    note.is_pinned = not note.is_pinned
    db.commit()
    return {"is_pinned": note.is_pinned}
