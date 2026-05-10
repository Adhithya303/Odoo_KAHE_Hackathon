# WanderIQ — AI-Powered Travel Planning Platform

A full-stack AI-powered travel platform with ML recommendations, smart itineraries, and budget prediction.

## Architecture

```
Odoo_KAHE_Hackathon/
├── frontend/          # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/       # Axios API layer
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Route pages
│   │   ├── store/     # Zustand state management
│   │   └── utils/     # Constants, formatters
│   └── ...
├── backend/
│   ├── app/           # FastAPI application
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic validation
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   └── middleware/ # Error handling
│   └── ml/            # Standalone ML service
└── traveloop_db_setup.sql  # MySQL schema
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8+

### Database
```bash
mysql -u root -p < traveloop_db_setup.sql
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# Edit .env with your database credentials
uvicorn app.main:app --reload --port 8000
```

### ML Service
```bash
cd backend
python -m ml.service
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- 🤖 AI-powered itinerary generation (Gemini API)
- 💰 ML budget prediction
- 🗺️ Interactive maps with Leaflet
- 💬 AI travel assistant chatbot
- 📊 Semantic destination recommendations
- 🔐 JWT authentication with refresh tokens
- 📱 Fully responsive design

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| GET | /api/destinations | List destinations |
| GET | /api/destinations/trending | Trending destinations |
| GET | /api/destinations/search | Search destinations |
| POST | /api/trips | Create trip |
| POST | /api/trips/{id}/itinerary/generate | AI itinerary |
| POST | /api/trips/{id}/budget/predict | Budget prediction |
| POST | /api/chatbot/message | AI chatbot |
