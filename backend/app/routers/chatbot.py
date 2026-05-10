"""Chatbot router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, get_optional_user
from app.models.user import User
from app.models.trip import Trip
from app.models.destination import Destination
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot_service import chat_with_gemini

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


@router.post("/message", response_model=ChatResponse)
async def send_message(req: ChatRequest, user: User = Depends(get_optional_user), db: Session = Depends(get_db)):
    dest_name = None
    trip_info = None

    if req.destination_id:
        dest = db.query(Destination).filter(Destination.id == req.destination_id).first()
        if dest: dest_name = dest.name

    if req.trip_id and user:
        trip = db.query(Trip).filter(Trip.id == req.trip_id, Trip.user_id == user.id).first()
        if trip:
            trip_info = {"name": trip.name, "dates": f"{trip.start_date} to {trip.end_date}", "budget": str(trip.total_budget)}

    history = [{"role": m.role, "content": m.content} for m in req.conversation_history]
    result = await chat_with_gemini(req.message, history, dest_name, trip_info)
    return ChatResponse(**result)
