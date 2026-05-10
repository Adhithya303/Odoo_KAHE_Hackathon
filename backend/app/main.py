"""FastAPI main application — CORS, router registration, startup."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.middleware.error_handler import error_handler
from app.routers import auth, destinations, recommendations, trips, budget, chatbot, external

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


@app.get("/")
def root():
    return {"name": "WanderIQ API", "version": "1.0.0", "status": "running"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
