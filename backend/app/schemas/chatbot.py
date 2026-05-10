"""Chatbot Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    trip_id: Optional[int] = None
    destination_id: Optional[int] = None
    conversation_history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
