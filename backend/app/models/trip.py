"""Trip ORM model — maps to trips, trip_stops tables."""
from sqlalchemy import Column, Integer, String, Text, Date, Enum, DateTime, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.user import User
from app.models.checklist import PackingChecklist


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cover_photo_url = Column(String(500), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_budget = Column(Numeric(12, 2), nullable=True)
    predicted_budget = Column(Numeric(12, 2), nullable=True)
    visibility = Column(Enum("private", "public"), nullable=False, default="private")
    status = Column(Enum("planning", "ongoing", "completed", "cancelled"), nullable=False, default="planning")
    trip_scope = Column(Enum("Domestic", "International"), default="Domestic")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="trips")
    stops = relationship("TripStop", back_populates="trip", cascade="all, delete-orphan", order_by="TripStop.sort_order")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    checklist = relationship("PackingChecklist", back_populates="trip", cascade="all, delete-orphan")
    notes = relationship("TripNote", back_populates="trip", cascade="all, delete-orphan")

    @property
    def duration_days(self):
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0


class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="SET NULL"), nullable=True)
    custom_place = Column(String(255), nullable=True)
    section_title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    arrival_date = Column(Date, nullable=True)
    departure_date = Column(Date, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    stop_budget = Column(Numeric(12, 2), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # Relationships
    trip = relationship("Trip", back_populates="stops")
    destination = relationship("Destination")
    activities = relationship("TripStopActivity", back_populates="stop", cascade="all, delete-orphan", order_by="TripStopActivity.sort_order")


class TripNote(Base):
    __tablename__ = "trip_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    stop_id = Column(Integer, ForeignKey("trip_stops.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    note_type = Column(String(50), default="general")
    note_date = Column(Date, nullable=True)
    day_number = Column(Integer, nullable=True)
    stop_tag = Column(String(100), nullable=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    trip = relationship("Trip", back_populates="notes")

