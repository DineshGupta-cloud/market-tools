from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/risk", tags=["Risk"])

class RiskRequest(BaseModel):
    capital: float = Field(gt=0)
    risk_percent: float = Field(gt=0, le=100)
    entry_price: float = Field(gt=0)
    stop_loss: float = Field(gt=0)
    target_price: float = Field(gt=0)
    lot_size: int = Field(default=1, gt=0)
    brokerage_per_lot: float = Field(default=0, ge=0)

@router.post("/calculate")
def calculate_risk(payload: RiskRequest):
    if payload.stop_loss >= payload.entry_price:
        raise HTTPException(status_code=400, detail="Stop-loss must be below entry price for a long position")
    if payload.target_price <= payload.entry_price:
        raise HTTPException(status_code=400, detail="Target price must be above entry price for a long position")

    risk_amount = payload.capital * payload.risk_percent / 100
    risk_per_unit = payload.entry_price - payload.stop_loss
    raw_quantity = int(risk_amount // risk_per_unit)
    quantity = (raw_quantity // payload.lot_size) * payload.lot_size
    if quantity <= 0:
        quantity = 0

    actual_risk = quantity * risk_per_unit
    gross_profit = quantity * (payload.target_price - payload.entry_price)
    reward_risk = gross_profit / actual_risk if actual_risk else 0
    max_investment = quantity * payload.entry_price
    brokerage = (quantity / payload.lot_size) * payload.brokerage_per_lot
    net_profit = gross_profit - brokerage
    net_loss = actual_risk + brokerage

    return {
        "capital": payload.capital,
        "risk_amount": round(risk_amount, 2),
        "risk_per_unit": round(risk_per_unit, 2),
        "quantity": quantity,
        "lots": quantity // payload.lot_size,
        "max_investment": round(max_investment, 2),
        "actual_risk": round(net_loss, 2),
        "gross_profit": round(gross_profit, 2),
        "brokerage": round(brokerage, 2),
        "net_profit": round(net_profit, 2),
        "reward_risk_ratio": round(reward_risk, 2),
        "risk_utilization_percent": round((net_loss / payload.capital) * 100, 2),
    }
