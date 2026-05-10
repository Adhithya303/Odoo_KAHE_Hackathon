"""Budget Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class ExpenseCreate(BaseModel):
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: str = Field(..., min_length=1)
    qty: float = 1.0
    unit: Optional[str] = None
    unit_cost: float
    expense_date: Optional[date] = None
    stop_id: Optional[int] = None


class ExpenseUpdate(BaseModel):
    category_id: Optional[int] = None
    description: Optional[str] = None
    qty: Optional[float] = None
    unit: Optional[str] = None
    unit_cost: Optional[float] = None
    expense_date: Optional[date] = None
    payment_status: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    trip_id: int
    stop_id: Optional[int] = None
    category_id: int
    category_name: Optional[str] = None
    description: str
    qty: float
    unit: Optional[str] = None
    unit_cost: float
    amount: float
    expense_date: Optional[date] = None
    payment_status: str

    class Config:
        from_attributes = True


class BudgetSummary(BaseModel):
    total_budget: Optional[float] = None
    predicted_budget: Optional[float] = None
    total_spent: float = 0
    remaining: float = 0
    per_person: float = 0
    by_category: dict = {}
    expenses: List[ExpenseResponse] = []


class BudgetPredictRequest(BaseModel):
    city: str
    duration: int
    travelers: int = 1
    hotel_type: str = "mid"
    season: Optional[str] = None
    trip_type: Optional[str] = None


class BudgetPredictResponse(BaseModel):
    predicted_total: float
    breakdown: dict = {}
    confidence: Optional[float] = None
