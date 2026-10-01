import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from seed import seed_database
from routers import trainees, verifications, analytics, courses
import auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pragatipath")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and auto-seed if empty
    logger.info("Initializing PragatiPath backend engine...")
    seed_database(force=False)
    yield
    # Shutdown
    logger.info("Shutting down PragatiPath backend engine.")


app = FastAPI(
    title="PragatiPath (प्रगतीPath) API",
    description=(
        "Longitudinal Skilling-Outcome Tracking Platform for Smart India Hackathon. "
        "Zero-cost prototype powered by FastAPI, SQLite/PostgreSQL schema, and local scikit-learn ML models."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - support local dev & Render frontend deployment
raw_origins = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pragatipath-frontend.onrender.com",
]
if raw_origins:
    allowed_origins.extend([o.strip() for o in raw_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, including dynamic Preview/Render domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(trainees.router)
app.include_router(verifications.router)
app.include_router(analytics.router)
app.include_router(courses.router)


@app.get("/")
def root():
    return {
        "platform": "PragatiPath (प्रगतीPath)",
        "tagline": "Longitudinal Skilling-Outcome Tracking Platform",
        "hackathon": "Smart India Hackathon Prototype",
        "status": "online",
        "cost_architecture": "100% Zero-Cost Local Stack (FastAPI + SQLite + Scikit-Learn)",
        "docs_url": "/docs",
        "features": {
            "feature_1": "Trainee Longitudinal Timeline & <15s Check-in Flow",
            "feature_2": "Employer 1-Tap Cryptographic Verification",
            "feature_3": "Government Analytics with real scikit-learn TF-IDF & Logistic Regression"
        }
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/admin/reseed")
def admin_reseed():
    """
    Convenience endpoint to reset demo data back to pristine state during presentations.
    """
    seed_database(force=True)
    return {"success": True, "message": "Database reset and reseeded with pristine SIH demo dataset."}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
