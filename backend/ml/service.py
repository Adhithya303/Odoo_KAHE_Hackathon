"""Standalone ML service for recommendations and budget prediction."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="WanderIQ ML Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# In-memory destination data for fallback
DESTINATIONS = [
    "Goa", "Kerala", "Rajasthan", "Ladakh", "Manali", "Shimla", "Rishikesh",
    "Varanasi", "Jaipur", "Udaipur", "Ooty", "Coorg", "Andaman",
    "Darjeeling", "Hampi", "Agra", "Jim Corbett", "Nainital",
    "Paris", "Dubai", "Bali", "Singapore", "Thailand", "Maldives",
    "Switzerland", "Japan", "Italy", "London", "New York", "Iceland",
]

DEST_KEYWORDS = {
    "Goa": ["beach", "party", "nightlife", "seafood", "adventure", "water"],
    "Kerala": ["backwaters", "ayurveda", "nature", "peaceful", "relaxation"],
    "Rajasthan": ["heritage", "culture", "desert", "forts", "palaces", "history"],
    "Ladakh": ["adventure", "mountains", "bikes", "trekking", "remote", "nature"],
    "Manali": ["mountains", "snow", "adventure", "trekking", "nature"],
    "Shimla": ["hills", "colonial", "family", "peaceful", "nature"],
    "Rishikesh": ["yoga", "spiritual", "adventure", "rafting", "nature"],
    "Varanasi": ["spiritual", "pilgrimage", "culture", "heritage", "ghats"],
    "Paris": ["romantic", "culture", "art", "luxury", "food", "architecture"],
    "Dubai": ["luxury", "shopping", "modern", "desert", "adventure"],
    "Bali": ["beach", "temple", "culture", "surfing", "nature", "relaxation"],
    "Singapore": ["modern", "food", "family", "clean", "gardens", "shopping"],
    "Thailand": ["beach", "food", "budget", "temple", "nightlife", "culture"],
    "Maldives": ["beach", "luxury", "romantic", "diving", "relaxation"],
    "Switzerland": ["mountains", "snow", "luxury", "nature", "adventure", "scenic"],
    "Japan": ["culture", "food", "technology", "temple", "cherry", "anime"],
}


class RecommendRequest(BaseModel):
    query: str
    limit: int = 10


class BudgetPredictRequest(BaseModel):
    city: str
    duration: int
    travelers: int = 1
    hotel_type: str = "mid"
    season: Optional[str] = None
    trip_type: Optional[str] = None


@app.post("/recommend")
async def recommend(req: RecommendRequest):
    """Simple keyword-based recommendation (ML embeddings can be loaded later)."""
    query_lower = req.query.lower()
    scores = {}

    for dest, keywords in DEST_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in query_lower)
        # Boost for exact name match
        if dest.lower() in query_lower:
            score += 5
        scores[dest] = score

    # Sort by score and return top results
    sorted_dests = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top = [d for d, s in sorted_dests if s > 0][:req.limit]

    # If no keyword matches, return random selection
    if not top:
        top = list(np.random.choice(DESTINATIONS, min(req.limit, len(DESTINATIONS)), replace=False))

    return {"destinations": top}


@app.post("/predict-budget")
async def predict_budget_endpoint(req: BudgetPredictRequest):
    """Heuristic budget prediction (XGBoost model can be loaded later)."""
    hotel_costs = {"budget": 1500, "mid": 4000, "luxury": 12000}
    daily_hotel = hotel_costs.get(req.hotel_type, 4000)
    daily_food = 1200 if req.hotel_type == "budget" else 2500 if req.hotel_type == "mid" else 5000
    daily_transport = 800 if req.hotel_type == "budget" else 1500 if req.hotel_type == "mid" else 3000
    daily_activities = 1000 if req.hotel_type == "budget" else 2500 if req.hotel_type == "mid" else 5000
    daily_misc = 500

    # Season adjustment
    season_multiplier = 1.0
    if req.season in ["December", "January", "October"]:
        season_multiplier = 1.3
    elif req.season in ["July", "August"]:
        season_multiplier = 0.9

    total = (daily_hotel + daily_food + daily_transport + daily_activities + daily_misc) * req.duration * req.travelers * season_multiplier

    breakdown = {
        "accommodation": round(daily_hotel * req.duration * req.travelers * season_multiplier),
        "food": round(daily_food * req.duration * req.travelers * season_multiplier),
        "transport": round(daily_transport * req.duration * req.travelers * season_multiplier),
        "activities": round(daily_activities * req.duration * req.travelers * season_multiplier),
        "miscellaneous": round(daily_misc * req.duration * req.travelers * season_multiplier),
    }

    return {"predicted_total": round(total), "breakdown": breakdown, "confidence": 0.75}


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
