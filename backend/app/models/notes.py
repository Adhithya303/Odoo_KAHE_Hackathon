"""Trip Notes / Journal ORM model — reexport from trip.py."""
# TripNote is defined in app.models.trip to keep the FK relationship with Trip.
# Import it here for convenience so routers can use app.models.notes.TripNote.
from app.models.trip import TripNote  # noqa: F401
