from fastapi import APIRouter, HTTPException
from ..models.audio import AcousticSynthesisRequest, SynthesisParameterResponse
from ..services.acoustic_service import acoustic_service

router = APIRouter(prefix="/audio", tags=["Acoustic Sound Reconstruction"])

@router.post("/synthesize-params", response_model=SynthesisParameterResponse)
def synthesize_parameters(req: AcousticSynthesisRequest):
    try:
        return acoustic_service.get_synthesis_parameters(req)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
