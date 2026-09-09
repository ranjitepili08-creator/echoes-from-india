from typing import List, Optional, Tuple
from pydantic import BaseModel
from .instrument import Instrument

class ImageClassifyRequest(BaseModel):
    image_data: str # Base64 data URL or Image URL
    forced_instrument_id: Optional[str] = None

class DetectedFeatureBox(BaseModel):
    feature: str
    confidence: float
    box: Optional[Tuple[float, float, float, float]] = None # [x, y, w, h] in percentages

class VisionDetectionResponse(BaseModel):
    instrument: Instrument
    confidence: int
    detectedFeatures: List[DetectedFeatureBox]
    analysisNotes: List[str]
    visualComparisonUrl: Optional[str] = None
