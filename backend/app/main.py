"""FastAPI main application — CORS, router registration, startup."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.middleware.error_handler import error_handler
from app.routers import auth, destinations, recommendations, trips, budget, chatbot, external
from app.routers import checklist, notes, community
from app.routers import admin as admin_router

# Ensure all models are imported so SQLAlchemy creates their tables
import app.models.user  # noqa
import app.models.trip  # noqa
import app.models.destination  # noqa
import app.models.checklist  # noqa
import app.models.community  # noqa
import app.models.preference  # noqa
import app.models.budget  # noqa
import app.models.activity  # noqa

app = FastAPI(title="WanderIQ API", version="1.0.0", description="AI-Powered Travel Planning Platform")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handler
app.middleware("http")(error_handler)

# Routers
app.include_router(auth.router)
app.include_router(destinations.router)
app.include_router(recommendations.router)
app.include_router(trips.router)
app.include_router(budget.router)
app.include_router(chatbot.router)
app.include_router(external.router)
app.include_router(checklist.router)
app.include_router(notes.router)
app.include_router(community.router)
app.include_router(admin_router.router)


@app.get("/")
def root():
    return {"name": "WanderIQ API", "version": "1.0.0", "status": "running"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
