"""Budget service — ML prediction and expense tracking."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.budget import Expense, ExpenseCategory
from app.models.trip import Trip
from app.config import settings
import httpx


async def predict_budget(city: str, duration: int, travelers: int, hotel_type: str, season: str = None, trip_type: str = None) -> dict:
    """Predict trip budget using ML service or heuristic fallback."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.ML_SERVICE_URL}/predict-budget",
                json={
                    "city": city,
                    "duration": duration,
                    "travelers": travelers,
                    "hotel_type": hotel_type,
                    "season": season or "any",
                    "trip_type": trip_type or "general",
                }
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass

    # Heuristic fallback
    return generate_heuristic_budget(city, duration, travelers, hotel_type)


def generate_heuristic_budget(city: str, duration: int, travelers: int, hotel_type: str) -> dict:
    """Generate budget estimate using heuristics."""
    # Base daily costs in INR
    hotel_costs = {"budget": 1500, "mid": 4000, "luxury": 12000}
    daily_hotel = hotel_costs.get(hotel_type, 4000)
    daily_food = 1200 if hotel_type == "budget" else 2500 if hotel_type == "mid" else 5000
    daily_transport = 800 if hotel_type == "budget" else 1500 if hotel_type == "mid" else 3000
    daily_activities = 1000 if hotel_type == "budget" else 2500 if hotel_type == "mid" else 5000
    daily_misc = 500

    total_per_person = (daily_hotel + daily_food + daily_transport + daily_activities + daily_misc) * duration
    total = total_per_person * travelers

    breakdown = {
        "accommodation": daily_hotel * duration * travelers,
        "food": daily_food * duration * travelers,
        "transport": daily_transport * duration * travelers,
        "activities": daily_activities * duration * travelers,
        "miscellaneous": daily_misc * duration * travelers,
    }

    return {
        "predicted_total": total,
        "breakdown": breakdown,
        "confidence": 0.7,
    }


def get_budget_summary(db: Session, trip_id: int, travelers: int = 1) -> dict:
    """Get budget summary for a trip."""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        return {}

    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()

    total_spent = sum(float(e.qty) * float(e.unit_cost) for e in expenses)
    total_budget = float(trip.total_budget) if trip.total_budget else 0
    predicted = float(trip.predicted_budget) if trip.predicted_budget else 0

    # Group by category
    by_category = {}
    for expense in expenses:
        cat = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense.category_id).first()
        cat_name = cat.name if cat else "Other"
        by_category[cat_name] = by_category.get(cat_name, 0) + (float(expense.qty) * float(expense.unit_cost))

    expense_list = []
    for e in expenses:
        cat = db.query(ExpenseCategory).filter(ExpenseCategory.id == e.category_id).first()
        expense_list.append({
            "id": e.id,
            "trip_id": e.trip_id,
            "stop_id": e.stop_id,
            "category_id": e.category_id,
            "category_name": cat.name if cat else "Other",
            "description": e.description,
            "qty": float(e.qty),
            "unit": e.unit,
            "unit_cost": float(e.unit_cost),
            "amount": float(e.qty) * float(e.unit_cost),
            "expense_date": str(e.expense_date) if e.expense_date else None,
            "payment_status": e.payment_status,
        })

    return {
        "total_budget": total_budget,
        "predicted_budget": predicted,
        "total_spent": total_spent,
        "remaining": total_budget - total_spent if total_budget else predicted - total_spent,
        "per_person": total_spent / travelers if travelers > 0 else total_spent,
        "by_category": by_category,
        "expenses": expense_list,
    }
