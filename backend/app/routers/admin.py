"""Admin analytics router — stats, users, trips, community management."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.destination import Destination
from app.models.community import CommunityPost, CommunityLike
from app.models.admin import AdminLog

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _require_admin(user: User):
    if user.role != "admin":
        raise HTTPException(403, "Admin access required")


@router.get("/stats")
def get_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_trips = db.query(func.count(Trip.id)).scalar() or 0
    total_destinations = db.query(func.count(Destination.id)).scalar() or 0
    total_community = db.query(func.count(CommunityPost.id)).scalar() or 0

    trips_this_week = db.query(func.count(Trip.id)).filter(Trip.created_at >= week_ago).scalar() or 0
    trips_this_month = db.query(func.count(Trip.id)).filter(Trip.created_at >= month_ago).scalar() or 0
    new_users_this_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar() or 0
    avg_trips = round(total_trips / total_users, 2) if total_users else 0

    # Top destinations by trip count (via TripStop -> Destination)
    from app.models.trip import TripStop
    top_dest_rows = (
        db.query(Destination.name, Destination.country, func.count(TripStop.id).label("tc"))
        .join(TripStop, TripStop.destination_id == Destination.id)
        .group_by(Destination.id)
        .order_by(desc("tc"))
        .limit(10)
        .all()
    )
    top_destinations = [{"name": r.name, "trip_count": r.tc, "country": r.country or ""} for r in top_dest_rows]
    most_popular = top_destinations[0] if top_destinations else {"name": "N/A", "trip_count": 0}

    # Trips over last 30 days
    trips_over_time = []
    for i in range(29, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(func.count(Trip.id)).filter(Trip.created_at >= day_start, Trip.created_at < day_end).scalar() or 0
        trips_over_time.append({"date": day_start.strftime("%Y-%m-%d"), "count": count})

    # User growth last 12 weeks
    user_growth = []
    for i in range(11, -1, -1):
        week_start = now - timedelta(weeks=i + 1)
        week_end = now - timedelta(weeks=i)
        count = db.query(func.count(User.id)).filter(User.created_at >= week_start, User.created_at < week_end).scalar() or 0
        user_growth.append({"week": week_start.strftime("%Y-W%W"), "new_users": count})

    # Budget distribution (by user preference budget_tier)
    from app.models.preference import UserPreference
    budget_rows = db.query(UserPreference.budget_tier, func.count().label("cnt")).group_by(UserPreference.budget_tier).all()
    budget_dist = {"budget": 0, "mid_range": 0, "premium": 0}
    for row in budget_rows:
        if row.budget_tier == "Budget":
            budget_dist["budget"] = row.cnt
        elif row.budget_tier == "Mid-range":
            budget_dist["mid_range"] = row.cnt
        elif row.budget_tier == "Premium":
            budget_dist["premium"] = row.cnt

    # Trip scope split
    scope_rows = db.query(Trip.trip_scope, func.count().label("cnt")).group_by(Trip.trip_scope).all()
    scope_split = {"domestic": 0, "international": 0}
    for row in scope_rows:
        if row.trip_scope == "Domestic":
            scope_split["domestic"] = row.cnt
        elif row.trip_scope == "International":
            scope_split["international"] = row.cnt

    # Status distribution
    status_rows = db.query(Trip.status, func.count().label("cnt")).group_by(Trip.status).all()
    status_dist = {"planning": 0, "ongoing": 0, "completed": 0, "cancelled": 0}
    for row in status_rows:
        if row.status in status_dist:
            status_dist[row.status] = row.cnt

    return {
        "total_users": total_users, "total_trips": total_trips,
        "total_destinations": total_destinations, "total_community_posts": total_community,
        "trips_this_week": trips_this_week, "trips_this_month": trips_this_month,
        "new_users_this_week": new_users_this_week, "avg_trips_per_user": avg_trips,
        "most_popular_destination": most_popular, "top_destinations": top_destinations,
        "trips_over_time": trips_over_time, "user_growth": user_growth,
        "budget_distribution": budget_dist, "trip_scope_split": scope_split,
        "status_distribution": status_dist,
    }


@router.get("/users")
def get_users(
    page: int = Query(default=1, ge=1), per_page: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None), sort: str = Query(default="newest"),
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    _require_admin(user)
    query = db.query(User)
    if search:
        query = query.filter(
            User.first_name.ilike(f"%{search}%") | User.last_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
        )
    if sort == "oldest":
        query = query.order_by(User.created_at)
    elif sort == "most_trips":
        trip_sub = db.query(Trip.user_id, func.count().label("tc")).group_by(Trip.user_id).subquery()
        query = query.outerjoin(trip_sub, User.id == trip_sub.c.user_id).order_by(desc(trip_sub.c.tc))
    else:
        query = query.order_by(desc(User.created_at))

    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for u in users:
        trip_count = db.query(func.count(Trip.id)).filter(Trip.user_id == u.id).scalar() or 0
        result.append({
            "id": u.id, "first_name": u.first_name, "last_name": u.last_name,
            "email": u.email, "role": u.role, "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "trip_count": trip_count,
        })

    return {"users": result, "total": total, "page": page, "pages": max(1, -(-total // per_page))}


class AdminUserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


@router.patch("/users/{user_id}")
def update_user(user_id: int, req: AdminUserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)
    if user_id == user.id:
        raise HTTPException(400, "Cannot modify yourself")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")
    if req.role is not None:
        target.role = req.role
    if req.is_active is not None:
        target.is_active = req.is_active
    db.commit(); db.refresh(target)
    return {"id": target.id, "role": target.role, "is_active": target.is_active}


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)
    if user_id == user.id:
        raise HTTPException(400, "Cannot deactivate yourself")
    
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")
        
    target.is_active = not target.is_active
    
    # Log the action
    log = AdminLog(
        admin_id=user.id,
        action="toggle_active",
        target_id=str(user_id),
        details=f"User {target.email} is_active set to {target.is_active}"
    )
    db.add(log)
    db.commit()
    
    return {"id": target.id, "is_active": target.is_active}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)
    if user_id == user.id:
        raise HTTPException(400, "Cannot delete yourself")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")
    db.delete(target); db.commit()
    return {"deleted": True}


@router.get("/trips")
def get_trips(
    page: int = Query(default=1, ge=1), per_page: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None), status: Optional[str] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    _require_admin(user)
    query = db.query(Trip)
    if search:
        query = query.filter(Trip.name.ilike(f"%{search}%"))
    if status:
        query = query.filter(Trip.status == status)
    if user_id:
        query = query.filter(Trip.user_id == user_id)
    total = query.count()
    trips = query.order_by(desc(Trip.created_at)).offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for t in trips:
        owner = db.query(User).filter(User.id == t.user_id).first()
        result.append({
            "id": t.id, "name": t.name, "status": t.status, "trip_scope": t.trip_scope,
            "start_date": str(t.start_date), "end_date": str(t.end_date),
            "total_budget": float(t.total_budget) if t.total_budget else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "user": {"id": owner.id, "first_name": owner.first_name, "last_name": owner.last_name, "email": owner.email} if owner else None,
            "destination_count": len(t.stops)
        })

    return {"trips": result, "total": total, "page": page, "pages": max(1, -(-total // per_page))}


@router.get("/community")
def get_community(
    page: int = Query(default=1, ge=1), per_page: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    _require_admin(user)
    total = db.query(func.count(CommunityPost.id)).scalar() or 0
    posts = db.query(CommunityPost).order_by(desc(CommunityPost.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    result = []
    for p in posts:
        like_count = db.query(func.count(CommunityLike.post_id)).filter(CommunityLike.post_id == p.id).scalar() or 0
        result.append({
            "id": p.id, "title": p.title, "destination_tag": p.destination_tag,
            "like_count": like_count, "view_count": p.views,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "author": {"id": p.user.id, "first_name": p.user.first_name, "last_name": p.user.last_name},
        })
    return {"posts": result, "total": total, "page": page, "pages": max(1, -(-total // per_page))}


@router.delete("/community/{post_id}")
def admin_delete_post(post_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    db.delete(post); db.commit()
    return {"deleted": True}
