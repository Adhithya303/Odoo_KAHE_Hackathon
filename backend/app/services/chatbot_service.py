"""Chatbot service for Gemini-backed travel assistance with safe fallbacks."""

from typing import List, Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


def _clean_text(value: Optional[str]) -> str:
    return (value or "").strip()


def _build_prompt(
    message: str,
    conversation_history: Optional[List[dict]] = None,
    destination_name: Optional[str] = None,
    trip_info: Optional[dict] = None,
) -> str:
    system_context = (
        "You are WanderIQ's AI Travel Assistant. Help with travel planning, destination suggestions, "
        "visa basics, packing, safety, local customs, food, and budget tips. Be friendly, practical, "
        "and concise. Use short paragraphs or bullet points when useful. If the user asks for visa or "
        "legal requirements, remind them to verify details with official sources."
    )

    context_parts = [system_context]
    if destination_name:
        context_parts.append(f"The user is currently exploring {destination_name}.")
    if trip_info:
        context_parts.append(f"Known trip details: {trip_info}.")

    prompt_lines = ["\n\n".join(context_parts), ""]

    for msg in (conversation_history or [])[-10:]:
        role = "User" if msg.get("role") == "user" else "Assistant"
        content = _clean_text(msg.get("content"))
        if content:
            prompt_lines.append(f"{role}: {content}")

    prompt_lines.append(f"User: {_clean_text(message)}")
    prompt_lines.append("Assistant:")
    return "\n".join(prompt_lines)


def _extract_reply(response) -> str:
    text = _clean_text(getattr(response, "text", ""))
    if text:
        return text

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = _clean_text(getattr(part, "text", ""))
            if part_text:
                return part_text
    return ""


async def chat_with_gemini(
    message: str,
    conversation_history: Optional[List[dict]] = None,
    destination_name: Optional[str] = None,
    trip_info: Optional[dict] = None,
) -> dict:
    """Send a chatbot message to Gemini and gracefully fall back if needed."""

    message = _clean_text(message)
    if not message:
        return {
            "reply": "Ask me anything about travel planning, destination ideas, budgets, visas, food, or packing.",
            "suggestions": generate_suggestions("", destination_name),
        }

    if not settings.GEMINI_API_KEY:
        return generate_mock_response(message, destination_name)

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_CHAT_MODEL)
        prompt = _build_prompt(message, conversation_history, destination_name, trip_info)
        response = model.generate_content(prompt)
        reply = _extract_reply(response)
        if not reply:
            raise ValueError("Gemini returned an empty response")

        return {
            "reply": reply,
            "suggestions": generate_suggestions(message, destination_name),
        }
    except Exception as exc:
        logger.warning("Gemini chatbot request failed; using fallback response: %s", exc)
        return generate_mock_response(message, destination_name)


def generate_mock_response(message: str, destination: Optional[str] = None) -> dict:
    """Generate helpful fallback responses when Gemini is unavailable."""

    msg_lower = _clean_text(message).lower()

    if "visa" in msg_lower:
        reply = (
            "For visa information, check the official embassy or immigration website for your passport country. "
            "Many destinations support e-visas or visa-on-arrival, but requirements can change, so verify them before booking."
        )
    elif "pack" in msg_lower:
        reply = (
            "Packing checklist:\n"
            "- Roll clothes to save space\n"
            "- Carry a universal adapter\n"
            "- Keep medicines in your cabin bag\n"
            "- Pack a reusable water bottle\n"
            "- Add sunscreen, comfortable shoes, and weather-specific layers"
        )
    elif "budget" in msg_lower or "cost" in msg_lower:
        reply = (
            f"Budget tips{' for ' + destination if destination else ''}:\n"
            "- Travel in shoulder season for better prices\n"
            "- Use local transport when possible\n"
            "- Eat where locals eat\n"
            "- Choose stays with breakfast included\n"
            "- Set a daily spending cap and track it"
        )
    elif "food" in msg_lower or "eat" in msg_lower:
        reply = (
            f"Food recommendations{' in ' + destination if destination else ''}:\n"
            "- Try the local street food scene\n"
            "- Ask locals or hotel staff for authentic spots\n"
            "- Use review apps to cross-check hygiene and quality\n"
            "- Try a signature regional dish\n"
            "- Visit local markets for snacks and produce"
        )
    elif "safe" in msg_lower or "danger" in msg_lower:
        reply = (
            "Safety tips:\n"
            "- Keep digital and printed copies of documents\n"
            "- Share your itinerary with someone you trust\n"
            "- Avoid isolated areas late at night\n"
            "- Use hotel safes for valuables\n"
            "- Stay aware of local advisories and your surroundings"
        )
    else:
        reply = (
            f"I'd love to help you plan your trip{' to ' + destination if destination else ''}. "
            "I can help with destination ideas, itineraries, budget tips, visa basics, food recommendations, packing, and safety advice.\n\n"
            "What would you like to know?"
        )

    return {"reply": reply, "suggestions": generate_suggestions(message, destination)}


def generate_suggestions(message: str, destination: Optional[str] = None) -> List[str]:
    """Generate quick-reply suggestions based on context."""

    if destination:
        return [
            f"Best places to visit in {destination}?",
            f"Visa requirements for {destination}?",
            f"Local cuisine in {destination}?",
            f"Weather in {destination}?",
            f"Budget tips for {destination}?",
        ]

    msg_lower = _clean_text(message).lower()
    if "visa" in msg_lower:
        return [
            "Documents needed?",
            "How early should I apply?",
            "Travel insurance tips",
            "Best time to visit?",
            "Budget breakdown",
        ]
    if "budget" in msg_lower or "cost" in msg_lower:
        return [
            "Cheap places to stay?",
            "Local transport tips",
            "Food on a budget?",
            "Best time to visit?",
            "Sample daily budget",
        ]
    if "pack" in msg_lower:
        return [
            "What clothes should I pack?",
            "Essentials for carry-on?",
            "Weather tips",
            "Medicine checklist",
            "Safety tips",
        ]

    return [
        "What should I pack?",
        "Best time to visit?",
        "Local food recommendations",
        "Safety tips",
        "Budget breakdown",
    ]
