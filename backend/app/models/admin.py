"""Admin ORM models — logs."""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(255), nullable=False)
    target_id = Column(String(50), nullable=True)  # ID of the user or trip being modified
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
