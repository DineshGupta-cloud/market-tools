"""Option analytics and optional AI copilot endpoints."""
from fastapi import APIRouter, HTTPException, Query
from app.api.routes.options import _chain
from app.services.options_analytics import enrich_chain, score_signal, summarize_chain
from app.services.options_copilot import generate_copilot_brief
router=APIRouter(prefix="/options",tags=["Option Analytics"])
def _payload(symbol,expiry):
    try: chain=enrich_chain(_chain(symbol,expiry))
    except HTTPException: raise
    except Exception as exc: raise HTTPException(status_code=422,detail="Unable to analyse option chain.") from exc
    metrics=summarize_chain(chain); signal=score_signal(metrics)
    return {"symbol":chain["symbol"],"expiry":chain["expiry"],"chain":chain,"metrics":metrics,"signal":signal}
@router.get("/analytics")
def option_analytics(symbol:str=Query(...),expiry:str=Query(...)):
    """Return Greeks-enriched chain and PCR, max-pain, OI-wall and IV metrics."""
    return _payload(symbol,expiry)
@router.get("/copilot")
def option_copilot(symbol:str=Query(...),expiry:str=Query(...)):
    """Return chain, volatility, risk and portfolio analyst summaries."""
    result=_payload(symbol,expiry)
    result["copilot"]=generate_copilot_brief(result["metrics"],result["signal"])
    return result
