from typing import List, Optional, Tuple, Dict
from pydantic import BaseModel
from .instrument import Instrument

class ImageClassifyRequest(BaseModel):
    image_data: str # Base64 data URL or Image URL
    forced_instrument_id: Optional[str] = None

class DetectedFeatureBox(BaseModel):
    feature: str
    confidence: float
    box: Optional[Tuple[float, float, float, float]] = None # [x, y, w, h] in percentages

class MatchCandidate(BaseModel):
    instrument_id: str
    instrument_name: str
    sanskrit_name: str
    category_label: str
    similarity_score: float # Raw cosine similarity (0.0 to 1.0)
    confidence_percent: int # Normalized percentage (e.g. 92%)
    rank: int # 1, 2, 3
    is_top_match: bool = False

class VisionDetectionResponse(BaseModel):
    instrument: Instrument
    confidence: int
    similarity_score: float
    confidence_gate_triggered: bool = False # True if confidence < threshold (needs confirmation)
    top_matches: List[MatchCandidate] = []
    classification_source: str = "clip_zero_shot_centroid" # "clip_zero_shot_centroid" or "hybrid_knn"
    detectedFeatures: List[DetectedFeatureBox]
    analysisNotes: List[str]
    visualComparisonUrl: Optional[str] = None

class ConfirmClassificationRequest(BaseModel):
    image_data: str # Base64 image
    predicted_instrument_id: str
    confirmed_instrument_id: str
    user_corrected: bool = False
    confidence_score: Optional[float] = None
    feedback_notes: Optional[str] = None

class DatasetStatsResponse(BaseModel):
    total_confirmed_samples: int
    samples_per_instrument: Dict[str, int]
    last_updated: str

