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
    similarity_score: float # Raw match score (0.0 to 1.0)
    confidence_percent: int # Normalized percentage (e.g. 92%)
    rank: int # 1, 2, 3
    is_top_match: bool = False
    matched_reasons: List[str] = [] # Explainability tags (e.g. ["Peacock Resonator", "Sympathetic Pegs"])
    attribute_breakdown: Optional[Dict[str, float]] = None

class ExtractedAttributesResponse(BaseModel):
    instrument_family: str
    resonator_shape: str
    resonator_material: str
    neck_length_category: str
    number_of_strings: str
    distinctive_features: List[str]
    playing_posture: str
    detected_color_palette: str
    spatial_aspect_ratio: float

class VisionDetectionResponse(BaseModel):
    instrument: Instrument
    confidence: int
    similarity_score: float
    confidence_gate_triggered: bool = False # True if confidence < threshold (needs confirmation)
    top_matches: List[MatchCandidate] = []
    classification_source: str = "vision_llm_attribute_matching" # "vision_llm_attribute_matching" or "hybrid_reference_knn"
    extracted_attributes: Optional[ExtractedAttributesResponse] = None
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


