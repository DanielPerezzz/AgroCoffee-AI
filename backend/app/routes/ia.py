from app.api.dependencies import CurrentUser
from app.ml.predictor import get_model_metrics
from fastapi import APIRouter


router = APIRouter(prefix="/ia", tags=["Modelo de IA"])


@router.get("/modelo")
async def model_information(current_user: CurrentUser) -> dict:
    return get_model_metrics()
