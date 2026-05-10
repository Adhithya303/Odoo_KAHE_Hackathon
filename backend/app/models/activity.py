"""Activity ORM models — maps to activities and trip_stop_activities."""
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Date, Time, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="SET NULL"), nullable=True)
    trip_type_id = Column(Integer, ForeignKey("trip_types.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    duration_hours = Column(Numeric(4, 1), nullable=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    source = Column(Enum("manual", "api", "community"), default="manual")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    destination = relationship("Destination", back_populates="activities")
    trip_type = relationship("TripType")


class TripStopActivity(Base):
    __tablename__ = "trip_stop_activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stop_id = Column(Integer, ForeignKey("trip_stops.id", ondelete="CASCADE"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    scheduled_date = Column(Date, nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    actual_cost = Column(Numeric(10, 2), nullable=True)
    notes = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)

    stop = relationship("TripStop", back_populates="activities")
    activity = relationship("Activity")
