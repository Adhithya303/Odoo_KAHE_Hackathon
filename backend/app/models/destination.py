"""Destination ORM model — maps to existing destinations and junction tables."""
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.activity import Activity

# Junction tables
destination_trip_types = Table(
    "destination_trip_types", Base.metadata,
    Column("destination_id", Integer, ForeignKey("destinations.id", ondelete="CASCADE"), primary_key=True),
    Column("trip_type_id", Integer, ForeignKey("trip_types.id", ondelete="CASCADE"), primary_key=True),
)

destination_group_types = Table(
    "destination_group_types", Base.metadata,
    Column("destination_id", Integer, ForeignKey("destinations.id", ondelete="CASCADE"), primary_key=True),
    Column("group_type_id", Integer, ForeignKey("group_types.id", ondelete="CASCADE"), primary_key=True),
)

destination_travel_months = Table(
    "destination_travel_months", Base.metadata,
    Column("destination_id", Integer, ForeignKey("destinations.id", ondelete="CASCADE"), primary_key=True),
    Column("month_id", Integer, ForeignKey("months.id", ondelete="CASCADE"), primary_key=True),
)


class TripType(Base):
    __tablename__ = "trip_types"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)


class GroupType(Base):
    __tablename__ = "group_types"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(30), unique=True, nullable=False)


class Month(Base):
    __tablename__ = "months"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(15), unique=True, nullable=False)


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), unique=True, nullable=False)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    trip_scope = Column(Enum("Domestic", "International"), nullable=False)
    description = Column(Text, nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    cost_index = Column(Enum("Low", "Medium", "High"), default="Medium")
    popularity_score = Column(Integer, default=50)
    avg_min_budget = Column(Integer, nullable=True)
    avg_max_budget = Column(Integer, nullable=True)
    climate_tags = Column(String(255), nullable=True)
    vibe_tags = Column(String(255), nullable=True)
    embedding_vector = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # Relationships
    trip_types = relationship("TripType", secondary=destination_trip_types, lazy="joined")
    group_types = relationship("GroupType", secondary=destination_group_types, lazy="joined")
    travel_months = relationship("Month", secondary=destination_travel_months, lazy="joined")
    activities = relationship("Activity", back_populates="destination")


class RecommendationProfile(Base):
    __tablename__ = "recommendation_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_scope = Column(Enum("Domestic", "International"), nullable=False)
    trip_type_tags = Column(String(255), nullable=False)
    min_budget = Column(Integer, nullable=False)
    max_budget = Column(Integer, nullable=False)
    group_type_tags = Column(String(100), nullable=False)
    travel_month_tags = Column(String(150), nullable=False)
    recommended_destination = Column(String(150), nullable=False)
