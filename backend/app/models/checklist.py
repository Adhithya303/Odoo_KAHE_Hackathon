"""Packing Checklist ORM model."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ChecklistCategory(Base):
    __tablename__ = "checklist_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)


class PackingChecklist(Base):
    __tablename__ = "packing_checklist"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("checklist_categories.id", ondelete="RESTRICT"), nullable=False)
    item_name = Column(String(255), nullable=False)
    is_packed = Column(Boolean, nullable=False, default=False)
    is_ai_suggested = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    trip = relationship("Trip", back_populates="checklist")
    category = relationship("ChecklistCategory")
