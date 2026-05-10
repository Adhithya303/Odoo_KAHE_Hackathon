"""Community ORM models — posts, likes, comments, saved trips."""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    views = Column(Integer, nullable=False, default=0)
    is_published = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    trip = relationship("Trip")
    comments = relationship("CommunityComment", back_populates="post", cascade="all, delete-orphan")


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    post = relationship("CommunityPost", back_populates="comments")
    user = relationship("User")


class CommunityLike(Base):
    __tablename__ = "community_likes"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class SavedTrip(Base):
    __tablename__ = "saved_trips"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), primary_key=True)
    saved_at = Column(DateTime, nullable=False, server_default=func.now())
