# WanderIQ

WanderIQ is a full-stack AI travel planning platform built for the Odoo x KAHE Hackathon. It combines trip planning, destination discovery, itinerary generation, budgeting, saved trips, community sharing, and an AI travel chatbot in one app.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Zustand, React Query, Axios
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth
- Database: MySQL
- AI/ML: Google Gemini for itinerary/chat assistance, local ML service for recommendation and budget features

## Core Features

- User signup, login, OTP verification, Google login, password reset
- Personalized destination recommendations
- Trip creation, multi-stop itinerary building with AI place suggestions, budget estimation, notes, and packing checklist
- Saved trips and public trip sharing
- Community and admin flows
- AI travel chatbot for destination, visa, safety, food, budget, and packing questions

## Project Structure

```text
Odoo_KAHE_Hackathon/
|-- frontend/              React app
|   |-- src/api/           API clients
|   |-- src/components/    Shared UI + chat window
|   |-- src/pages/         Route pages
|   |-- src/store/         Zustand stores
|   `-- src/utils/         Constants and helpers
|-- backend/               FastAPI app
|   |-- app/models/        SQLAlchemy models
|   |-- app/routers/       API routes
|   |-- app/schemas/       Pydantic schemas
|   |-- app/services/      Business logic + Gemini integrations
|   `-- ml/                ML recommendation service
|-- traveloop_db_setup.sql Database schema
`-- travel_recommendation_dataset.csv
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8+

## Environment Setup

Create these env files before starting the app.

### `backend/.env`

```env
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/traveloop
SECRET_KEY=change-me
REFRESH_SECRET_KEY=change-me-too
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password

OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6

GEMINI_API_KEY=your-gemini-api-key
GEMINI_CHAT_MODEL=gemini-1.5-flash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8000/auth/google/callback

FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8001
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8000
DEBUG=True
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Database Setup

From the project root:

```powershell
mysql -u root -p < traveloop_db_setup.sql
```

Then seed destinations:

```powershell
cd backend
python seed_from_csv.py
```

If MySQL connection issues happen on Windows, prefer `127.0.0.1` instead of `localhost` in `DATABASE_URL`.

## Run The Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend health check:

```text
http://localhost:8000/api/health
```

## Run The ML Service

Open a second terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m ml.service
```

## Run The Frontend

Open a third terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Chatbot Notes

The chatbot is available through the floating chat button in the UI and uses:

- Frontend component: `frontend/src/components/chat/ChatWindow.jsx`
- API client: `frontend/src/api/chatbot.js`
- Backend route: `backend/app/routers/chatbot.py`
- Backend service: `backend/app/services/chatbot_service.py`

Behavior:

- If `GEMINI_API_KEY` is configured and valid, the chatbot uses Gemini for replies.
- If Gemini is unavailable, the chatbot falls back to built-in travel responses so the feature still works instead of failing completely.
- Chat suggestions update dynamically based on user context and destination hints.

## API Overview

Some important endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/destinations`
- `GET /api/destinations/trending`
- `POST /api/trips`
- `POST /api/trips/{id}/itinerary/generate`
- `POST /api/chatbot/message`
- `GET /api/profile/saved-trips`

## Common Commands

Build the frontend:

```powershell
cd frontend
npm run build
```

Start backend dev server:

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

## Troubleshooting

- `401` errors from the frontend usually mean access/refresh tokens are stale. Log out and log back in.
- If Gemini features seem generic, verify `GEMINI_API_KEY` is present in `backend/.env`.
- If chatbot replies still fall back, check backend logs for Gemini errors.
- If OTP email is not sent, verify `SMTP_USER` and `SMTP_PASS`.
- If frontend API calls fail, verify `VITE_API_BASE_URL=http://localhost:8000`.
- Restart the frontend after changing `frontend/.env`.
- Restart the backend after changing `backend/.env`.

## Security Note

Do not commit real secrets to version control. If any real API keys, SMTP credentials, or OAuth secrets were added to local env files during development, rotate them before sharing or deploying the project.
