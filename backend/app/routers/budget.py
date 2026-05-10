"""Budget router — expense management and ML prediction."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.budget import Expense
from app.schemas.budget import ExpenseCreate, ExpenseUpdate, BudgetPredictRequest
from app.services.budget_service import predict_budget, get_budget_summary

router = APIRouter(prefix="/api/trips/{trip_id}/budget", tags=["budget"])


@router.get("")
def get_budget(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    return get_budget_summary(db, trip_id)


@router.post("/predict")
async def predict(trip_id: int, req: BudgetPredictRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    result = await predict_budget(req.city, req.duration, req.travelers, req.hotel_type, req.season, req.trip_type)
    trip.predicted_budget = result["predicted_total"]
    db.commit()
    return result


@router.post("/items")
def add_item(trip_id: int, req: ExpenseCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip: raise HTTPException(404, "Trip not found")
    expense = Expense(trip_id=trip_id, **req.model_dump())
    db.add(expense); db.commit(); db.refresh(expense)
    return {"id": expense.id, "message": "Item added"}


@router.put("/items/{item_id}")
def update_item(trip_id: int, item_id: int, req: ExpenseUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == item_id, Expense.trip_id == trip_id).first()
    if not expense: raise HTTPException(404, "Item not found")
    for f, v in req.model_dump(exclude_unset=True).items():
        setattr(expense, f, v)
    db.commit()
    return {"message": "Item updated"}


@router.delete("/items/{item_id}")
def delete_item(trip_id: int, item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == item_id, Expense.trip_id == trip_id).first()
    if not expense: raise HTTPException(404, "Item not found")
    db.delete(expense); db.commit()
    return {"message": "Item deleted"}
