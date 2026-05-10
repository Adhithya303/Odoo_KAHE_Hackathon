"""Community Feed router — posts, likes, comments, share trip."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user, get_optional_user
from app.models.user import User
from app.models.trip import Trip
from app.models.community import CommunityPost, CommunityComment, CommunityLike

router = APIRouter(prefix="/api/community", tags=["community"])


def _author_dict(user: User) -> dict:
    return {"id": user.id, "first_name": user.first_name, "last_name": user.last_name, "profile_photo_url": user.profile_photo_url}


def _post_dict(post: CommunityPost, uid: Optional[int], db: Session) -> dict:
    liked = False
    if uid:
        liked = db.query(CommunityLike).filter(CommunityLike.post_id == post.id, CommunityLike.user_id == uid).first() is not None
    like_count = db.query(func.count(CommunityLike.post_id)).filter(CommunityLike.post_id == post.id).scalar() or 0
    comment_count = db.query(func.count(CommunityComment.id)).filter(CommunityComment.post_id == post.id).scalar() or 0
    trip_data = None
    if post.trip_id and post.trip:
        t = post.trip
        trip_data = {"id": t.id, "name": t.name, "start_date": str(t.start_date), "end_date": str(t.end_date)}
    return {
        "id": post.id, "title": post.title, "content": (post.body or "")[:200],
        "full_content": post.body, "cover_image_url": post.cover_image_url,
        "destination_tag": post.destination_tag, "like_count": like_count,
        "comment_count": comment_count, "view_count": post.views,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
        "author": _author_dict(post.user), "trip": trip_data, "is_liked_by_me": liked,
    }


class PostCreateRequest(BaseModel):
    title: str
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    destination_tag: Optional[str] = None
    trip_id: Optional[int] = None


class PostUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    destination_tag: Optional[str] = None


class CommentRequest(BaseModel):
    content: str


@router.get("")
def get_feed(
    sort: str = Query(default="newest"), search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1), per_page: int = Query(default=12, ge=1, le=50),
    current_user: Optional[User] = Depends(get_optional_user), db: Session = Depends(get_db),
):
    query = db.query(CommunityPost).filter(CommunityPost.is_published == True)
    if search:
        query = query.filter(CommunityPost.title.ilike(f"%{search}%") | CommunityPost.destination_tag.ilike(f"%{search}%"))
    if sort == "most_liked":
        sub = db.query(CommunityLike.post_id, func.count().label("cnt")).group_by(CommunityLike.post_id).subquery()
        query = query.outerjoin(sub, CommunityPost.id == sub.c.post_id).order_by(desc(sub.c.cnt))
    elif sort == "most_viewed":
        query = query.order_by(desc(CommunityPost.views))
    else:
        query = query.order_by(desc(CommunityPost.created_at))
    total = query.count()
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    uid = current_user.id if current_user else None
    return {"posts": [_post_dict(p, uid, db) for p in posts], "total": total, "page": page, "pages": max(1, -(-total // per_page))}


@router.get("/{post_id}")
def get_post(post_id: int, current_user: Optional[User] = Depends(get_optional_user), db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    post.views = (post.views or 0) + 1
    db.commit(); db.refresh(post)
    comments = db.query(CommunityComment).filter(CommunityComment.post_id == post_id).order_by(CommunityComment.created_at.desc()).limit(10).all()
    uid = current_user.id if current_user else None
    data = _post_dict(post, uid, db)
    data["comments"] = [{"id": c.id, "content": c.content, "created_at": c.created_at.isoformat() if c.created_at else None, "author": _author_dict(c.user)} for c in comments]
    return data


@router.post("")
def create_post(req: PostCreateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.trip_id:
        trip = db.query(Trip).filter(Trip.id == req.trip_id, Trip.user_id == user.id).first()
        if not trip:
            raise HTTPException(403, "You do not own that trip")
    post = CommunityPost(user_id=user.id, trip_id=req.trip_id, title=req.title, body=req.content, cover_image_url=req.cover_image_url, destination_tag=req.destination_tag, is_published=True, views=0)
    db.add(post); db.commit(); db.refresh(post)
    return _post_dict(post, user.id, db)


@router.put("/{post_id}")
def update_post(post_id: int, req: PostUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id, CommunityPost.user_id == user.id).first()
    if not post:
        raise HTTPException(404, "Post not found or not authorised")
    if req.title is not None: post.title = req.title
    if req.content is not None: post.body = req.content
    if req.cover_image_url is not None: post.cover_image_url = req.cover_image_url
    if req.destination_tag is not None: post.destination_tag = req.destination_tag
    db.commit(); db.refresh(post)
    return _post_dict(post, user.id, db)


@router.delete("/{post_id}")
def delete_post(post_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id, CommunityPost.user_id == user.id).first()
    if not post:
        raise HTTPException(404, "Post not found or not authorised")
    db.delete(post); db.commit()
    return {"deleted": True}


@router.post("/{post_id}/like")
def toggle_like(post_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    existing = db.query(CommunityLike).filter(CommunityLike.post_id == post_id, CommunityLike.user_id == user.id).first()
    if existing:
        db.delete(existing); liked = False
    else:
        db.add(CommunityLike(post_id=post_id, user_id=user.id)); liked = True
    db.commit()
    like_count = db.query(func.count(CommunityLike.post_id)).filter(CommunityLike.post_id == post_id).scalar() or 0
    return {"liked": liked, "like_count": like_count}


@router.post("/{post_id}/comments")
def add_comment(post_id: int, req: CommentRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    comment = CommunityComment(post_id=post_id, user_id=user.id, content=req.content)
    db.add(comment); db.commit(); db.refresh(comment)
    return {"id": comment.id, "content": comment.content, "created_at": comment.created_at.isoformat() if comment.created_at else None, "author": _author_dict(user)}


@router.delete("/{post_id}/comments/{comment_id}")
def delete_comment(post_id: int, comment_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    comment = db.query(CommunityComment).filter(CommunityComment.id == comment_id, CommunityComment.post_id == post_id, CommunityComment.user_id == user.id).first()
    if not comment:
        raise HTTPException(404, "Comment not found or not authorised")
    db.delete(comment); db.commit()
    return {"deleted": True}


@router.post("/share-trip/{trip_id}")
def share_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(404, "Trip not found or not authorised")
    dest_name = None
    if trip.stops:
        stop = trip.stops[0]
        dest_name = stop.destination.name if stop.destination else stop.custom_place
    content = trip.description or f"Check out my trip to {dest_name or 'this amazing destination'}!"
    post = CommunityPost(user_id=user.id, trip_id=trip_id, title=trip.name, body=content, cover_image_url=trip.cover_photo_url, destination_tag=dest_name, is_published=True, views=0)
    db.add(post); db.commit(); db.refresh(post)
    return _post_dict(post, user.id, db)
