"""ML service for home-screen personalization and budget estimation.

This service uses the existing `travel_recommendation_dataset.csv` and a trained
`personalization_model.pkl` artifact. If the artifact does not exist yet, the
service can train it from the CSV and persist it for later runs.
"""

from __future__ import annotations

import os
import pickle
import warnings
from functools import lru_cache
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.metrics import accuracy_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, MultiLabelBinarizer
from xgboost import XGBClassifier

BASE_DIR = Path(__file__).resolve().parents[2]
CSV_PATH = Path(os.getenv("TRAVEL_RECOMMENDATION_CSV", BASE_DIR / "travel_recommendation_dataset.csv"))
MODEL_PATH = Path(os.getenv("PERSONALIZATION_MODEL_PATH", Path(__file__).resolve().parent / "artifacts" / "personalization_model.pkl"))

app = FastAPI(title="WanderIQ ML Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class HomeScreenRequest(BaseModel):
    trip_scope: str = Field(..., examples=["Domestic", "International"])
    trip_types: list[str] = Field(default_factory=list)
    min_budget: float
    max_budget: float
    top_n: int = Field(default=10, ge=1, le=20)


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


def load_and_prepare(csv_path: Path):
    df = pd.read_csv(csv_path)

    required_columns = {"trip_scope", "trip_type", "min_budget", "max_budget", "recommended_destination"}
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {', '.join(sorted(missing))}")

    df["trip_type_list"] = df["trip_type"].astype(str).str.split(",").apply(lambda lst: [t.strip() for t in lst if t.strip()])

    mlb_type = MultiLabelBinarizer()
    trip_type_enc = pd.DataFrame(
        mlb_type.fit_transform(df["trip_type_list"]),
        columns=[f"type_{c}" for c in mlb_type.classes_],
    )

    le_scope = LabelEncoder()
    df["scope_enc"] = le_scope.fit_transform(df["trip_scope"])

    df["budget_range"] = df["max_budget"] - df["min_budget"]
    budget_cols = ["min_budget", "max_budget", "budget_range"]
    scaler = MinMaxScaler()
    budget_enc = pd.DataFrame(scaler.fit_transform(df[budget_cols]), columns=budget_cols)

    le_dest = LabelEncoder()
    y = le_dest.fit_transform(df["recommended_destination"])

    X = pd.concat(
        [
            df[["scope_enc"]].reset_index(drop=True),
            trip_type_enc.reset_index(drop=True),
            budget_enc.reset_index(drop=True),
        ],
        axis=1,
    )

    return X, y, mlb_type, le_scope, le_dest, scaler, budget_cols


def train(X, y):
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=500,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.05,
        eval_metric="mlogloss",
        early_stopping_rounds=30,
        random_state=42,
        verbosity=0,
    )

    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

    hold_out_acc = accuracy_score(y_val, model.predict(X_val))
    best_iter = model.best_iteration if model.best_iteration is not None else model.n_estimators
    print(f"[Model] Best n_estimators (early stop): {best_iter}")
    print(f"[Model] Hold-out Accuracy            : {hold_out_acc:.4f}  ({hold_out_acc * 100:.1f}%)")

    cv_model = XGBClassifier(
        n_estimators=max(int(best_iter), 1),
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.05,
        eval_metric="mlogloss",
        random_state=42,
        verbosity=0,
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(cv_model, X, y, cv=cv, scoring="accuracy")
    print(f"[Model] 5-Fold CV Accuracy            : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    return model


def save_model(path: Path, model, mlb_type, le_scope, le_dest, scaler, budget_cols):
    path.parent.mkdir(parents=True, exist_ok=True)
    artifacts = {
        "model": model,
        "mlb_type": mlb_type,
        "le_scope": le_scope,
        "le_dest": le_dest,
        "scaler": scaler,
        "budget_cols": budget_cols,
    }
    with open(path, "wb") as f:
        pickle.dump(artifacts, f)
    print(f"[Model] Saved to {path}")


def load_model(path: Path):
    with open(path, "rb") as f:
        return pickle.load(f)


@lru_cache(maxsize=1)
def get_artifacts():
    if MODEL_PATH.exists():
        return load_model(MODEL_PATH)

    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Training CSV not found at {CSV_PATH}")

    X, y, mlb_type, le_scope, le_dest, scaler, budget_cols = load_and_prepare(CSV_PATH)
    model = train(X, y)
    save_model(MODEL_PATH, model, mlb_type, le_scope, le_dest, scaler, budget_cols)
    return load_model(MODEL_PATH)


def predict_home_screen(
    trip_scope: str,
    trip_types: list[str],
    min_budget: float,
    max_budget: float,
    artifacts: dict,
    top_n: int = 5,
    direct_threshold: float = 0.30,
) -> list[dict]:
    model = artifacts["model"]
    mlb_type = artifacts["mlb_type"]
    le_scope = artifacts["le_scope"]
    le_dest = artifacts["le_dest"]
    scaler = artifacts["scaler"]
    budget_cols = artifacts.get("budget_cols", ["min_budget", "max_budget"])

    known_types = [t for t in trip_types if t in mlb_type.classes_]

    scope_v = pd.DataFrame(le_scope.transform([trip_scope]).reshape(-1, 1), columns=["scope_enc"])
    type_v = pd.DataFrame(mlb_type.transform([known_types]), columns=[f"type_{c}" for c in mlb_type.classes_])

    budget_range = max_budget - min_budget
    raw_budget = pd.DataFrame(
        [[min_budget, max_budget, budget_range]],
        columns=["min_budget", "max_budget", "budget_range"],
    )[budget_cols]
    budget_v = pd.DataFrame(scaler.transform(raw_budget), columns=budget_cols)

    X = pd.concat([scope_v, type_v, budget_v], axis=1)
    proba = model.predict_proba(X)[0]
    top_idx = np.argsort(proba)[::-1][:top_n]

    results = []
    for rank, idx in enumerate(top_idx, 1):
        score = float(proba[idx])
        results.append(
            {
                "rank": rank,
                "destination": le_dest.classes_[idx],
                "match_score": round(score * 100, 1),
                "match_type": "Direct Match" if score >= direct_threshold else "Partial Match",
            }
        )

    return results


@app.post("/recommend-home-screen")
async def recommend_home_screen(req: HomeScreenRequest):
    try:
        artifacts = get_artifacts()
        results = predict_home_screen(
            trip_scope=req.trip_scope,
            trip_types=req.trip_types,
            min_budget=req.min_budget,
            max_budget=req.max_budget,
            artifacts=artifacts,
            top_n=req.top_n,
        )
        return {"destinations": results}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/recommend")
async def recommend(req: RecommendRequest):
    try:
        artifacts = get_artifacts()
        query = req.query.lower()

        trip_scope = "International" if any(word in query for word in ["international", "abroad", "foreign"]) else "Domestic"
        known_types = [
            trip_type
            for trip_type in artifacts["mlb_type"].classes_
            if trip_type.lower() in query
        ]

        budget_floor = 0.0
        budget_ceiling = 0.0
        if any(token in query for token in ["luxury", "premium", "high budget"]):
            budget_floor, budget_ceiling = 100000, 500000
        elif any(token in query for token in ["budget", "cheap", "low cost"]):
            budget_floor, budget_ceiling = 5000, 50000
        else:
            budget_floor, budget_ceiling = 10000, 150000

        results = predict_home_screen(
            trip_scope=trip_scope,
            trip_types=known_types,
            min_budget=budget_floor,
            max_budget=budget_ceiling,
            artifacts=artifacts,
            top_n=req.limit,
        )
        return {"destinations": [item["destination"] for item in results]}
    except Exception:
        fallback = ["Goa", "Kerala", "Rajasthan", "Ladakh", "Manali"]
        return {"destinations": fallback[: req.limit]}


@app.post("/predict-budget")
async def predict_budget_endpoint(req: BudgetPredictRequest):
    hotel_costs = {"budget": 1500, "mid": 4000, "luxury": 12000}
    daily_hotel = hotel_costs.get(req.hotel_type, 4000)
    daily_food = 1200 if req.hotel_type == "budget" else 2500 if req.hotel_type == "mid" else 5000
    daily_transport = 800 if req.hotel_type == "budget" else 1500 if req.hotel_type == "mid" else 3000
    daily_activities = 1000 if req.hotel_type == "budget" else 2500 if req.hotel_type == "mid" else 5000
    daily_misc = 500

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
    return {
        "status": "healthy",
        "model_loaded": MODEL_PATH.exists(),
        "csv_loaded": CSV_PATH.exists(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
