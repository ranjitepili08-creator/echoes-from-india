from fastapi import APIRouter, HTTPException
from ..models.vision import ImageClassifyRequest, VisionDetectionResponse
from ..services.vision_service import vision_service

router = APIRouter(prefix="/vision", tags=["Vision AI Recognition"])

@router.post("/classify", response_model=VisionDetectionResponse)
def classify_image(req: ImageClassifyRequest):
    try:
        return vision_service.classify_instrument(req.image_data, req.forced_instrument_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
