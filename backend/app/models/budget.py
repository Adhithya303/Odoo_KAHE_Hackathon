"""Budget/Expense ORM models — maps to expenses and expense_categories."""
from sqlalchemy import Column, Integer, String, Enum, DateTime, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    stop_id = Column(Integer, ForeignKey("trip_stops.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(Integer, ForeignKey("expense_categories.id", ondelete="RESTRICT"), nullable=False)
    description = Column(String(255), nullable=False)
    qty = Column(Numeric(6, 2), nullable=False, default=1)
    unit = Column(String(50), nullable=True)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    # amount is a computed column in MySQL: qty * unit_cost
    expense_date = Column(Date, nullable=True)
    payment_status = Column(Enum("pending", "paid", "cancelled"), default="pending")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    trip = relationship("Trip", back_populates="expenses")
    category = relationship("ExpenseCategory")

    @property
    def amount(self):
        return float(self.qty or 0) * float(self.unit_cost or 0)
