"""Chatbot service — Gemini API wrapper with context injection."""
from app.config import settings
from typing import List, Optional


async def chat_with_gemini(
    message: str,
    conversation_history: List[dict] = None,
    destination_name: str = None,
    trip_info: dict = None,
) -> dict:
    """Send message to Gemini with travel context."""

    system_context = """You are WanderIQ's AI Travel Assistant. You help travelers plan trips, 
provide destination information, visa requirements, packing tips, local customs, safety advice, 
food recommendations, and budget tips. Be friendly, concise, and helpful. 
Use emojis occasionally to keep the tone warm. Format responses with bullet points when listing items."""

    if destination_name:
        system_context += f"\n\nThe user is currently exploring {destination_name}."
    if trip_info:
        system_context += f"\n\nTrip details: {trip_info}"

    if not settings.GEMINI_API_KEY:
        return generate_mock_response(message, destination_name)

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-pro")

        # Build conversation
        full_prompt = f"{system_context}\n\n"
        if conversation_history:
            for msg in conversation_history[-10:]:
                role = "User" if msg.get("role") == "user" else "Assistant"
                full_prompt += f"{role}: {msg.get('content', '')}\n"
        full_prompt += f"User: {message}\nAssistant:"

        response = model.generate_content(full_prompt)
        reply = response.text.strip()

        suggestions = generate_suggestions(message, destination_name)

        return {"reply": reply, "suggestions": suggestions}

    except Exception as e:
        return generate_mock_response(message, destination_name)


def generate_mock_response(message: str, destination: str = None) -> dict:
    """Generate a helpful mock response when Gemini is unavailable."""
    msg_lower = message.lower()

    if "visa" in msg_lower:
        reply = "🛂 For visa information, I recommend checking your country's official travel advisory website. Most countries offer e-visa or visa-on-arrival options. Always apply at least 2-3 weeks before travel!"
    elif "pack" in msg_lower:
        reply = "🧳 Essential packing tips:\n• Roll clothes to save space\n• Pack a universal power adapter\n• Keep medications in carry-on\n• Bring a reusable water bottle\n• Don't forget sunscreen and a hat!"
    elif "budget" in msg_lower or "cost" in msg_lower:
        reply = f"💰 Budget tips{' for ' + destination if destination else ''}:\n• Travel during shoulder season for lower prices\n• Use local transport instead of taxis\n• Eat where locals eat\n• Book accommodations with free breakfast\n• Set a daily spending limit and track expenses"
    elif "food" in msg_lower or "eat" in msg_lower:
        reply = f"🍽️ Food recommendations{' in ' + destination if destination else ''}:\n• Try the local street food scene\n• Ask hotel staff for authentic restaurant tips\n• Use food apps for reviews\n• Try the national dish\n• Visit local markets for fresh produce"
    elif "safe" in msg_lower or "danger" in msg_lower:
        reply = "🛡️ Safety tips:\n• Keep copies of important documents\n• Share your itinerary with someone at home\n• Register with your embassy\n• Use hotel safes for valuables\n• Stay aware of your surroundings"
    else:
        reply = f"✈️ I'd love to help you plan your trip{' to ' + destination if destination else ''}! I can assist with:\n• 🗺️ Destination recommendations\n• 📋 Itinerary planning\n• 💰 Budget estimation\n• 🧳 Packing tips\n• 🛂 Visa information\n• 🍽️ Food recommendations\n\nWhat would you like to know?"

    suggestions = generate_suggestions(message, destination)
    return {"reply": reply, "suggestions": suggestions}


def generate_suggestions(message: str, destination: str = None) -> List[str]:
    """Generate quick-reply suggestions based on context."""
    base_suggestions = [
        "What should I pack?",
        "Best time to visit?",
        "Local food recommendations",
        "Safety tips",
        "Budget breakdown",
    ]

    if destination:
        return [
            f"Best places to visit in {destination}?",
            f"Visa requirements for {destination}?",
            f"Local cuisine in {destination}?",
            f"Weather in {destination}?",
            f"Budget tips for {destination}?",
        ]

    return base_suggestions[:5]
