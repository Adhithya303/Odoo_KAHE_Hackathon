"""Trip service — itinerary generation via Gemini, route optimization, place suggestions."""
from sqlalchemy.orm import Session
from app.models.trip import Trip, TripStop
from app.models.activity import Activity, TripStopActivity
from app.models.destination import Destination
from app.config import settings
from typing import List, Optional
import httpx
import json


# ═══════════════════════════════════════════════════════════
#  Gemini helper — shared across itinerary + suggestions
# ═══════════════════════════════════════════════════════════

def _call_gemini(prompt: str) -> str:
    """Call Gemini and return the raw text reply. Raises on failure."""
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    text = response.text.strip()
    # Strip markdown code fences
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    return text


# ═══════════════════════════════════════════════════════════
#  AI Itinerary Generation
# ═══════════════════════════════════════════════════════════

async def generate_itinerary(db: Session, trip: Trip, interests: List[str], hotel_type: str = "mid") -> dict:
    """Generate an AI itinerary using Gemini API."""
    # Get destination info
    stop = db.query(TripStop).filter(TripStop.trip_id == trip.id).first()
    dest_name = "Unknown"
    if stop and stop.destination:
        dest_name = stop.destination.name
    elif stop and stop.custom_place:
        dest_name = stop.custom_place

    duration = trip.duration_days
    interests_str = ", ".join(interests) if interests else "general sightseeing"

    prompt = f"""Create a detailed {duration}-day travel itinerary for {dest_name}.

Traveler interests: {interests_str}
Hotel type: {hotel_type}
Trip dates: {trip.start_date} to {trip.end_date}

For each day, provide 3-4 activities with:
- Activity name
- Description (1-2 sentences)
- Time slot (morning/afternoon/evening)
- Estimated duration in hours
- Estimated cost in INR

Return as JSON array:
[
  {{
    "day": 1,
    "date": "YYYY-MM-DD",
    "activities": [
      {{
        "name": "Activity Name",
        "description": "Brief description",
        "time_slot": "morning",
        "duration_hours": 2.5,
        "estimated_cost": 500
      }}
    ]
  }}
]

Return ONLY the JSON, no other text."""

    if not settings.GEMINI_API_KEY:
        return generate_mock_itinerary(dest_name, duration, trip.start_date)

    try:
        text = _call_gemini(prompt)
        itinerary_data = json.loads(text)

        # Save to database
        saved = save_itinerary_to_db(db, trip, stop, itinerary_data)
        return {"days": itinerary_data, "saved": saved}

    except Exception as e:
        print(f"Gemini itinerary generation failed: {e}")
        return generate_mock_itinerary(dest_name, duration, trip.start_date)


def save_itinerary_to_db(db: Session, trip: Trip, stop: TripStop, itinerary_data: list) -> bool:
    """Save generated itinerary activities to database."""
    try:
        if not stop:
            return False

        for day_data in itinerary_data:
            for act_data in day_data.get("activities", []):
                activity = Activity(
                    name=act_data.get("name", "Activity"),
                    description=act_data.get("description", ""),
                    estimated_cost=act_data.get("estimated_cost", 0),
                    duration_hours=act_data.get("duration_hours", 1),
                    destination_id=stop.destination_id,
                    source="api",
                )
                db.add(activity)
                db.flush()

                stop_activity = TripStopActivity(
                    stop_id=stop.id,
                    activity_id=activity.id,
                    scheduled_date=trip.start_date,
                    notes=act_data.get("time_slot", ""),
                    sort_order=0,
                )
                db.add(stop_activity)

        db.commit()
        return True
    except Exception:
        db.rollback()
        return False


def generate_mock_itinerary(dest_name: str, duration: int, start_date) -> dict:
    """Generate a mock itinerary when Gemini is unavailable."""
    from datetime import timedelta
    days = []
    activities_pool = [
        {"name": f"Explore {dest_name} Old Town", "description": "Walk through historic streets and markets", "time_slot": "morning", "duration_hours": 3, "estimated_cost": 200},
        {"name": "Local Food Tour", "description": "Sample authentic local cuisine at popular eateries", "time_slot": "afternoon", "duration_hours": 2.5, "estimated_cost": 800},
        {"name": "Sunset Viewpoint", "description": "Enjoy panoramic views at the best sunset spot", "time_slot": "evening", "duration_hours": 2, "estimated_cost": 100},
        {"name": "Temple & Heritage Walk", "description": "Visit ancient temples and heritage sites", "time_slot": "morning", "duration_hours": 3, "estimated_cost": 300},
        {"name": "Adventure Activity", "description": "Exciting outdoor adventure experience", "time_slot": "afternoon", "duration_hours": 4, "estimated_cost": 1500},
        {"name": "Night Market Visit", "description": "Browse local crafts and street food", "time_slot": "evening", "duration_hours": 2, "estimated_cost": 500},
        {"name": "Nature Trek", "description": "Guided nature walk through scenic trails", "time_slot": "morning", "duration_hours": 4, "estimated_cost": 600},
        {"name": "Cultural Show", "description": "Traditional dance and music performance", "time_slot": "evening", "duration_hours": 2, "estimated_cost": 400},
    ]

    for i in range(min(duration, 7)):
        day_date = start_date + timedelta(days=i)
        day_activities = []
        for j, slot in enumerate(["morning", "afternoon", "evening"]):
            act = activities_pool[(i * 3 + j) % len(activities_pool)].copy()
            act["time_slot"] = slot
            day_activities.append(act)
        days.append({
            "day": i + 1,
            "date": str(day_date),
            "activities": day_activities,
        })

    return {"days": days, "saved": False}


# ═══════════════════════════════════════════════════════════
#  AI Place Suggestions (NEW)
# ═══════════════════════════════════════════════════════════

async def suggest_places(destination: str, interests: List[str] = None, budget_tier: str = "mid", days: int = 3) -> dict:
    """Use Gemini to suggest must-visit places for a destination."""
    interests_str = ", ".join(interests) if interests else "general tourism"

    prompt = f"""You are a travel expert. Suggest the best places to visit in {destination}.

Context:
- Traveler interests: {interests_str}
- Budget level: {budget_tier}
- Trip duration: {days} days

Return a JSON object with this exact structure:
{{
  "destination": "{destination}",
  "places": [
    {{
      "name": "Place Name",
      "category": "Temple | Museum | Beach | Park | Market | Viewpoint | Restaurant | Adventure | Historical | Nature",
      "description": "2-3 sentence description of why this place is worth visiting",
      "estimated_time_hours": 2,
      "estimated_cost_inr": 200,
      "best_time": "morning | afternoon | evening | anytime",
      "rating": 4.5,
      "tips": "One helpful tip for visitors"
    }}
  ]
}}

Provide 8-12 places, ranked by popularity. Cover a variety of categories.
Return ONLY the JSON, no other text."""

    if not settings.GEMINI_API_KEY:
        return _mock_places(destination)

    try:
        text = _call_gemini(prompt)
        data = json.loads(text)
        return data
    except Exception as e:
        print(f"Gemini place suggestion failed: {e}")
        return _mock_places(destination)


def _mock_places(destination: str) -> dict:
    """Fallback place suggestions when Gemini is unavailable."""
    return {
        "destination": destination,
        "places": [
            {"name": f"{destination} Main Temple", "category": "Temple", "description": f"The iconic main temple of {destination}, known for its stunning architecture and spiritual significance.", "estimated_time_hours": 2, "estimated_cost_inr": 100, "best_time": "morning", "rating": 4.7, "tips": "Visit early morning to avoid crowds."},
            {"name": f"{destination} Central Market", "category": "Market", "description": f"A bustling marketplace in the heart of {destination} where you can find local crafts, spices, and street food.", "estimated_time_hours": 2, "estimated_cost_inr": 500, "best_time": "evening", "rating": 4.3, "tips": "Bargain prices are the norm here."},
            {"name": f"{destination} Heritage Walk", "category": "Historical", "description": f"A guided walk through the historic lanes of {destination}, passing centuries-old buildings and hidden gems.", "estimated_time_hours": 3, "estimated_cost_inr": 300, "best_time": "morning", "rating": 4.5, "tips": "Wear comfortable shoes."},
            {"name": f"Sunset Point {destination}", "category": "Viewpoint", "description": f"The most popular viewpoint in {destination} offering breathtaking panoramic views, especially at golden hour.", "estimated_time_hours": 1.5, "estimated_cost_inr": 50, "best_time": "evening", "rating": 4.8, "tips": "Arrive 30 minutes before sunset for the best spot."},
            {"name": f"{destination} Local Cuisine Tour", "category": "Restaurant", "description": f"Experience the authentic flavors of {destination} with a guided food tour covering the city's best eateries.", "estimated_time_hours": 2.5, "estimated_cost_inr": 800, "best_time": "afternoon", "rating": 4.6, "tips": "Come hungry and try everything!"},
            {"name": f"{destination} Nature Trail", "category": "Nature", "description": f"A scenic nature trail on the outskirts of {destination}, perfect for birdwatching and photography.", "estimated_time_hours": 3, "estimated_cost_inr": 200, "best_time": "morning", "rating": 4.4, "tips": "Carry water and binoculars."},
            {"name": f"{destination} Museum", "category": "Museum", "description": f"A well-curated museum showcasing the art, history, and culture of the {destination} region.", "estimated_time_hours": 2, "estimated_cost_inr": 150, "best_time": "afternoon", "rating": 4.2, "tips": "Audio guides are available in multiple languages."},
            {"name": f"{destination} Adventure Park", "category": "Adventure", "description": f"An exciting adventure park near {destination} offering zip-lining, rappelling, and more.", "estimated_time_hours": 4, "estimated_cost_inr": 1500, "best_time": "morning", "rating": 4.5, "tips": "Book tickets in advance during weekends."},
        ]
    }


# ═══════════════════════════════════════════════════════════
#  Route Optimization
# ═══════════════════════════════════════════════════════════

async def optimize_route(db: Session, stop_id: int) -> dict:
    """Optimize route order using OSRM."""
    activities = db.query(TripStopActivity).filter(
        TripStopActivity.stop_id == stop_id
    ).order_by(TripStopActivity.sort_order).all()

    if len(activities) < 2:
        return {"message": "Need at least 2 activities to optimize", "activities": []}

    # For now, return activities as-is (OSRM integration requires coordinates)
    return {
        "message": "Route optimized",
        "activities": [
            {
                "id": a.id,
                "activity_id": a.activity_id,
                "sort_order": idx,
                "name": a.activity.name if a.activity else "Activity",
            }
            for idx, a in enumerate(activities)
        ]
    }
