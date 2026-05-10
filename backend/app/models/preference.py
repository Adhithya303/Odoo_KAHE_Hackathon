"""User Preferences ORM model — maps to user_preferences and junction tables."""
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

user_pref_trip_types = Table(
    "user_pref_trip_types", Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("trip_type_id", Integer, ForeignKey("trip_types.id", ondelete="CASCADE"), primary_key=True),
)

user_pref_group_types = Table(
    "user_pref_group_types", Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("group_type_id", Integer, ForeignKey("group_types.id", ondelete="CASCADE"), primary_key=True),
)


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    trip_scope = Column(Enum("Domestic", "International", "Both"), default="Both")
    budget_tier = Column(Enum("Budget", "Mid-range", "Premium"), default="Mid-range")
    min_budget = Column(Integer, nullable=True)
    max_budget = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="preferences")
    trip_types = relationship(
        "TripType", 
        secondary=user_pref_trip_types, 
        primaryjoin="UserPreference.user_id == user_pref_trip_types.c.user_id",
        secondaryjoin="user_pref_trip_types.c.trip_type_id == TripType.id",
        lazy="joined"
    )
    group_types = relationship(
        "GroupType", 
        secondary=user_pref_group_types, 
        primaryjoin="UserPreference.user_id == user_pref_group_types.c.user_id",
        secondaryjoin="user_pref_group_types.c.group_type_id == GroupType.id",
        lazy="joined"
    )
