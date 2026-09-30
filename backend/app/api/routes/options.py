from datetime import date, timedelta
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/options", tags=["Options"])

SUPPORTED_SYMBOLS = {"NIFTY": 25200.0, "BANKNIFTY": 57500.0, "FINNIFTY": 26800.0}


def _expiries():
    today = date.today()
    days_until_thursday = (3 - today.weekday()) % 7
    first = today + timedelta(days=days_until_thursday)
    return [(first + timedelta(days=7 * i)).isoformat() for i in range(6)]


def _validate_symbol(symbol: str) -> str:
    symbol = symbol.upper()
    if symbol not in SUPPORTED_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Unsupported symbol: {symbol}")
    return symbol


def _chain(symbol: str, expiry: str):
    symbol = _validate_symbol(symbol)
    if expiry not in _expiries():
        raise HTTPException(status_code=400, detail="Unsupported expiry for sample data")
    spot = SUPPORTED_SYMBOLS[symbol]
    step = 50 if symbol != "BANKNIFTY" else 100
    atm = round(spot / step) * step
    rows = []
    for offset in range(-10, 11):
        strike = atm + offset * step
        distance = (strike - atm) / step
        call_ltp = max(8.0, round(190 - abs(distance) * 24 - max(distance, 0) * 5, 2))
        put_ltp = max(8.0, round(185 - abs(distance) * 23 + min(distance, 0) * 4, 2))
        call_oi = int(120000 + abs(distance) * 18000 + max(distance, 0) * 12000)
        put_oi = int(115000 + abs(distance) * 17000 + max(-distance, 0) * 11000)
        rows.append({
            "strike": strike, "moneyness": "ITM" if strike < atm else "ATM" if strike == atm else "OTM",
            "call": {"ltp": call_ltp, "change_pct": round(2.8 - distance * 0.45, 2), "volume": int(18000 + max(0, 8 - abs(distance)) * 4200), "oi": call_oi, "oi_change": int(4000 - distance * 700), "iv": round(12.5 + abs(distance) * 0.35, 2)},
            "put": {"ltp": put_ltp, "change_pct": round(2.4 + distance * 0.42, 2), "volume": int(17000 + max(0, 8 - abs(distance)) * 4000), "oi": put_oi, "oi_change": int(3500 + distance * 650), "iv": round(13.0 + abs(distance) * 0.38, 2)},
        })
    return {"symbol": symbol, "expiry": expiry, "spot": spot, "atm_strike": atm, "step": step, "items": rows}


@router.get("/expiries")
def expiries(symbol: str):
    symbol = _validate_symbol(symbol)
    return {"symbol": symbol, "items": _expiries()}


@router.get("/chain")
def chain(symbol: str, expiry: str):
    return _chain(symbol, expiry)


@router.get("/atm-premium")
def atm_premium(symbol: str, expiry: str):
    data = _chain(symbol, expiry)
    row = next(item for item in data["items"] if item["strike"] == data["atm_strike"])
    return {"symbol": data["symbol"], "expiry": data["expiry"], "spot": data["spot"], "atm_strike": data["atm_strike"], "call_ltp": row["call"]["ltp"], "put_ltp": row["put"]["ltp"], "total_premium": round(row["call"]["ltp"] + row["put"]["ltp"], 2)}


@router.get("/atm-premium/history")
def atm_premium_history(symbol: str, expiry: str, points: int = 30):
    data = _chain(symbol, expiry)
    row = next(item for item in data["items"] if item["strike"] == data["atm_strike"])
    points = max(5, min(points, 60))
    base_call, base_put = row["call"]["ltp"], row["put"]["ltp"]
    items = []
    for i in range(points):
        call = round(max(1, base_call + (i - points + 1) * 1.35 + ((i % 5) - 2) * 2.1), 2)
        put = round(max(1, base_put + (i - points + 1) * 1.15 + (((i + 2) % 6) - 3) * 1.8), 2)
        items.append({"time": f"{9 + (i * 5) // 60:02d}:{30 + (i * 5) % 60:02d}", "call_premium": call, "put_premium": put, "total_premium": round(call + put, 2)})
    return {"symbol": data["symbol"], "expiry": data["expiry"], "atm_strike": data["atm_strike"], "items": items}
