"""External APIs proxy router — weather, currency, flights, hotels."""
from fastapi import APIRouter, Query, HTTPException
from app.config import settings
import httpx

router = APIRouter(prefix="/api/external", tags=["external"])


@router.get("/weather/{city}")
async def get_weather(city: str):
    if not settings.OPENWEATHER_API_KEY:
        return get_mock_weather(city)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={"q": city, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"}
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass
    return get_mock_weather(city)


@router.get("/currency")
async def get_currency(frm: str = Query("INR", alias="from"), to: str = "USD"):
    if not settings.EXCHANGERATE_API_KEY:
        return {"from": frm, "to": to, "rate": 0.012 if frm == "INR" and to == "USD" else 1.0}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGERATE_API_KEY}/pair/{frm}/{to}"
            )
            if resp.status_code == 200:
                data = resp.json()
                return {"from": frm, "to": to, "rate": data.get("conversion_rate", 1.0)}
    except Exception:
        pass
    return {"from": frm, "to": to, "rate": 1.0}


def get_mock_weather(city: str):
    return {
        "city": city,
        "current": {"temp": 28, "humidity": 65, "description": "Partly cloudy", "icon": "02d"},
        "forecast": [
            {"day": "Today", "high": 30, "low": 22, "description": "Sunny"},
            {"day": "Tomorrow", "high": 29, "low": 21, "description": "Partly cloudy"},
            {"day": "Day 3", "high": 31, "low": 23, "description": "Clear"},
            {"day": "Day 4", "high": 28, "low": 20, "description": "Rain"},
            {"day": "Day 5", "high": 27, "low": 19, "description": "Thunderstorm"},
        ]
    }
