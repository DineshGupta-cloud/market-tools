from fastapi import APIRouter

router = APIRouter(prefix="/options", tags=["Options"])

@router.get("/expiries")
def expiries(symbol: str):
    return {"symbol": symbol, "items": [], "message": "Option Chain integration will be added in Phase 3."}

@router.get("/chain")
def chain(symbol: str, expiry: str):
    return {"symbol": symbol, "expiry": expiry, "items": [], "message": "Option Chain integration will be added in Phase 3."}

@router.get("/atm-premium")
def atm_premium(symbol: str, expiry: str):
    return {"symbol": symbol, "expiry": expiry, "data": None, "message": "ATM Premium integration will be added in Phase 4."}
