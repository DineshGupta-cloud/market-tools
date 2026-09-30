# Market Tools

An original market-analysis web application focused on four tools:

1. Stock Screener
2. Option Chain
3. ATM Premium
4. Risk Calculator

## Stack

- Frontend: React + Vite + MUI
- Backend: FastAPI + Pydantic
- Production: Docker + Nginx
- Market data integration: dedicated service layer

## Run Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

Frontend: http://localhost
Backend: http://localhost:8000

## Production hardening

- Environment-based configuration
- Request IDs and request logging
- Global unhandled-error response
- API timeout handling in frontend
- Production Docker images
- Nginx SPA routing
- Backend health check and container restart policy
- Interactive API docs disabled when `ENVIRONMENT=production`

## Development Phases

- [x] Phase 1 - Project foundation
- [x] Phase 2 - Stock Screener
- [x] Phase 3 - Option Chain
- [x] Phase 4 - ATM Premium
- [x] Phase 5 - Risk Calculator
- [x] Phase 6 - Production hardening, Docker and deployment structure

> Current market values are sample data. Live NSE/EOD integration will be added through the dedicated market-data service layer.
