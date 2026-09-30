# Market Tools

An original market-analysis web application focused on four tools:

1. Stock Screener
2. Option Chain
3. ATM Premium
4. Risk Calculator

## Stack

- Frontend: React + Vite + MUI
- Backend: FastAPI + Pydantic
- Market data integration: service layer (Phase 2+)

## Project Structure

- `frontend/` - React application
- `backend/` - FastAPI application

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

## Development Phases

- [x] Phase 1 - Project foundation
- [x] Phase 2 - Stock Screener
- [x] Phase 3 - Option Chain
- [x] Phase 4 - ATM Premium
- [x] Phase 5 - Risk Calculator
- [ ] Phase 6 - Caching, charts, production hardening and Docker

> Current market values are sample data. Live NSE/EOD integration will be added through a dedicated market-data service layer.
