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
    raw = get_budget_summary(db, trip_id)

    # Normalise items list: expose as 'items' with 'category' (not category_id)
    items = []
    for e in (raw.get("expenses") or []):
        items.append({
            "id": e["id"],
            "category": e.get("category_name") or e.get("category", "Other"),
            "description": e.get("description", ""),
            "quantity": e.get("qty", 1),
            "unit_cost": e.get("unit_cost", 0),
            "amount": e.get("amount", 0),
        })

    # Build by_day breakdown from expenses grouped by expense_date
    by_day_map = {}
    for e in (raw.get("expenses") or []):
        day_key = e.get("expense_date") or "1"
        by_day_map[day_key] = by_day_map.get(day_key, 0) + e.get("amount", 0)
    by_day = [{"day": i + 1, "date": k, "amount": v} for i, (k, v) in enumerate(sorted(by_day_map.items()))]

    return {
        "items": items,
        "summary": {
            "total_budget": raw.get("total_budget", 0),
            "total_spent": raw.get("total_spent", 0),
            "remaining": raw.get("remaining", 0),
            "by_category": raw.get("by_category", {}),
            "by_day": by_day,
        }
    }



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
