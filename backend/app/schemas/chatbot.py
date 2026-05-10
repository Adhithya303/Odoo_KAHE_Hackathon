"""Chatbot Pydantic schemas."""

from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    trip_id: Optional[int] = None
    destination_id: Optional[int] = None
    conversation_history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = Field(default_factory=list)
