from fastapi import APIRouter

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.get("")
def stocks():
    return {"items": [], "message": "Stock data integration will be added in Phase 2."}

@router.post("/screener/run")
def run_screener(payload: dict):
    return {"filters": payload, "items": [], "message": "Stock Screener is planned for Phase 2."}
