import math
from typing import List
from ..models.audio import AcousticSynthesisRequest, SynthesisParameterResponse
from .database_service import db_service

class AcousticService:
    @staticmethod
    def get_synthesis_parameters(req: AcousticSynthesisRequest) -> SynthesisParameterResponse:
        inst = db_service.get_instrument_by_id(req.instrument_id)
        if not inst:
            raise ValueError(f"Instrument '{req.instrument_id}' not found")

        acoustic = inst.acousticProfile
        
        # Calculate harmonic overtone distribution based on timbre
        if acoustic.timbreType == "plucked_wire":
            # Jivari overtone dispersion: rich odd & even harmonics
            harmonics = [1.0, 0.85, 0.72, 0.65, 0.52, 0.41, 0.33, 0.25]
        elif acoustic.timbreType == "plucked_silk":
            # Silk string: warm fundamental, soft rolloff
            harmonics = [1.0, 0.45, 0.22, 0.10, 0.05]
        elif acoustic.timbreType == "percussive_ceramic":
            # Inharmonic ceramic modes
            harmonics = [1.0, 0.35, 0.65, 0.12]
        else:
            harmonics = [1.0, 0.6, 0.4, 0.3, 0.2]

        envelope = {
            "attack": 0.015 if acoustic.timbreType != "bowed_folk" else 0.08,
            "decay": acoustic.decayTime * 0.3,
            "sustain": 0.4 if acoustic.timbreType == "bowed_folk" else 0.1,
            "release": acoustic.decayTime * 0.7
        }

        return SynthesisParameterResponse(
            instrument_id=inst.id,
            timbre_type=acoustic.timbreType,
            resonator_frequency_hz=acoustic.bodyResonanceFreq,
            jawari_buzz_intensity=acoustic.jawariBuzz,
            decay_time_seconds=acoustic.decayTime,
            harmonic_weights=harmonics,
            formant_filter_q=3.5,
            envelope=envelope
        )

acoustic_service = AcousticService()
