"""Recommendations router — personalized and query-based."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.recommendation_service import (
    get_recommendations_for_user, search_by_query, get_trending_destinations,
)
from pydantic import BaseModel

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/for-me")
async def for_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = await get_recommendations_for_user(db, user.id)
    return {"destinations": results}


class QueryRequest(BaseModel):
    query: str


@router.post("/by-query")
async def by_query(req: QueryRequest, db: Session = Depends(get_db)):
    results = await search_by_query(db, req.query)
    return {"destinations": results}
