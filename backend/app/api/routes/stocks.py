from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/stocks", tags=["Stocks"])

STOCKS = [
    {"symbol":"RELIANCE","name":"Reliance Industries","price":1428.50,"change_pct":1.42,"volume":8245000,"ema9":1415.20,"ema20":1398.10,"ema50":1368.40,"ema100":1324.70,"rsi":61.8,"week52_high":1608.80,"week52_low":1114.20},
    {"symbol":"TCS","name":"Tata Consultancy Services","price":3185.30,"change_pct":-0.35,"volume":2145000,"ema9":3198.10,"ema20":3210.60,"ema50":3148.20,"ema100":3065.50,"rsi":52.4,"week52_high":4592.25,"week52_low":2934.75},
    {"symbol":"HDFCBANK","name":"HDFC Bank","price":1742.10,"change_pct":0.88,"volume":9120000,"ema9":1732.40,"ema20":1715.60,"ema50":1688.90,"ema100":1612.30,"rsi":59.2,"week52_high":2030.00,"week52_low":1363.55},
    {"symbol":"INFY","name":"Infosys","price":1518.70,"change_pct":1.05,"volume":4310000,"ema9":1507.20,"ema20":1492.30,"ema50":1465.10,"ema100":1418.80,"rsi":63.1,"week52_high":1975.75,"week52_low":1353.10},
    {"symbol":"ICICIBANK","name":"ICICI Bank","price":1296.40,"change_pct":0.62,"volume":6750000,"ema9":1288.50,"ema20":1272.10,"ema50":1248.40,"ema100":1198.70,"rsi":57.6,"week52_high":1478.00,"week52_low":1074.10},
]

class ScreenerFilters(BaseModel):
    search: str | None = None
    min_price: float | None = Field(default=None, ge=0)
    max_price: float | None = Field(default=None, ge=0)
    min_rsi: float | None = Field(default=None, ge=0, le=100)
    max_rsi: float | None = Field(default=None, ge=0, le=100)
    min_change_pct: float | None = None
    max_change_pct: float | None = None
    price_above_ema20: bool = False
    ema_alignment: bool = False
    near_52w_high_pct: float | None = Field(default=None, ge=0, le=100)

@router.get("")
def stocks():
    return {"items": STOCKS, "count": len(STOCKS)}

@router.post("/screener/run")
def run_screener(filters: ScreenerFilters):
    items = STOCKS[:]
    if filters.search:
        q = filters.search.lower()
        items = [s for s in items if q in s["symbol"].lower() or q in s["name"].lower()]
    if filters.min_price is not None: items = [s for s in items if s["price"] >= filters.min_price]
    if filters.max_price is not None: items = [s for s in items if s["price"] <= filters.max_price]
    if filters.min_rsi is not None: items = [s for s in items if s["rsi"] >= filters.min_rsi]
    if filters.max_rsi is not None: items = [s for s in items if s["rsi"] <= filters.max_rsi]
    if filters.min_change_pct is not None: items = [s for s in items if s["change_pct"] >= filters.min_change_pct]
    if filters.max_change_pct is not None: items = [s for s in items if s["change_pct"] <= filters.max_change_pct]
    if filters.price_above_ema20: items = [s for s in items if s["price"] > s["ema20"]]
    if filters.ema_alignment: items = [s for s in items if s["ema9"] > s["ema20"] > s["ema50"] > s["ema100"]]
    if filters.near_52w_high_pct is not None:
        items = [s for s in items if ((s["week52_high"] - s["price"]) / s["week52_high"] * 100) <= filters.near_52w_high_pct]
    return {"items": items, "count": len(items), "filters": filters.model_dump(exclude_none=True)}
