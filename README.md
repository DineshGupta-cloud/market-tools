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
# Windows Git Bash: source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: http://localhost:8000
Docs: http://localhost:8000/docs

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Development Phases

- [x] Phase 1 - Project foundation
- [ ] Phase 2 - Stock Screener
- [ ] Phase 3 - Option Chain
- [ ] Phase 4 - ATM Premium
- [ ] Phase 5 - Risk Calculator
- [ ] Phase 6 - Caching, charts, production hardening and Docker
