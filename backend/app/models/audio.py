from typing import List, Optional
from pydantic import BaseModel

class AcousticSynthesisRequest(BaseModel):
    instrument_id: str
    base_frequency: float = 261.63
    duration: float = 2.0
    velocity: float = 0.9

class SynthesisParameterResponse(BaseModel):
    instrument_id: str
    timbre_type: str
    resonator_frequency_hz: float
    jawari_buzz_intensity: float
    decay_time_seconds: float
    harmonic_weights: List[float]
    formant_filter_q: float
    envelope: dict
