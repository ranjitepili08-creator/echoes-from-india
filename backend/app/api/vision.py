from fastapi import APIRouter, HTTPException
from ..models.vision import (
    ImageClassifyRequest, 
    VisionDetectionResponse, 
    ConfirmClassificationRequest,
    DatasetStatsResponse
)
from ..services.vision_service import vision_service
from ..services.clip_service import clip_service

router = APIRouter(prefix="/vision", tags=["Vision AI Recognition"])

@router.post("/classify", response_model=VisionDetectionResponse)
def classify_image(req: ImageClassifyRequest):
    try:
        return vision_service.classify_instrument(req.image_data, req.forced_instrument_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/confirm")
def confirm_classification(req: ConfirmClassificationRequest):
    """
    Log user-confirmed or corrected instrument label into the active learning dataset.
    """
    try:
        res = clip_service.log_confirmed_sample(
            image_data=req.image_data,
            predicted_id=req.predicted_instrument_id,
            confirmed_id=req.confirmed_instrument_id,
            user_corrected=req.user_corrected,
            feedback_notes=req.feedback_notes
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dataset-stats", response_model=DatasetStatsResponse)
def get_dataset_stats():
    """
    Retrieve counts of confirmed training samples accumulated per instrument.
    """
    try:
        return clip_service.get_dataset_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

