from fastapi import APIRouter

router = APIRouter(prefix="/risk", tags=["Risk"])

@router.post("/calculate")
def calculate_risk(payload: dict):
    return {"input": payload, "data": None, "message": "Risk Calculator logic will be added in Phase 5."}
