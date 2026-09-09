from typing import List, Optional, Literal, Tuple
from pydantic import BaseModel, Field

InstrumentFamily = Literal['tata', 'sushira', 'avanaddha', 'ghana']
ConservationStatus = Literal['extinct', 'endangered', 'rare', 'living']
HistoricalPeriod = Literal['vedic', 'sangam', 'maurya_gupta', 'medieval', 'mughal', 'colonial_modern']

class MaterialComponent(BaseModel):
    name: str
    description: str
    acousticRole: Optional[str] = None

class TreatiseCitation(BaseModel):
    treatise: str
    chapter: Optional[str] = None
    quote: str
    translation: str

class AcousticProfile(BaseModel):
    resonatorType: str
    bodyResonanceFreq: float
    jawariBuzz: float
    decayTime: float
    harmonicRichness: float
    sympatheticTarab: bool
    timbreType: str
    frequencyRange: str
    soundReconstructionNotes: str

class NoteDefinition(BaseModel):
    sargam: str
    western: str
    frequency: float
    keyboardKey: str

class BolDefinition(BaseModel):
    name: str
    westernEquivalent: str
    key: str
    description: str
    pitch: float
    decay: float
    harmonicNoise: float
    head: Literal['left_bass', 'right_treble', 'both']

class PlayInterfaceConfig(BaseModel):
    type: Literal['strings', 'jaltarang', 'pakhawaj', 'wind']
    stringCount: Optional[int] = None
    notes: List[NoteDefinition] = []
    bols: Optional[List[BolDefinition]] = None
    droneNotes: Optional[List[NoteDefinition]] = None
    waterLevels: Optional[List[int]] = None

class DetectionCues(BaseModel):
    shapePattern: str
    resonators: str
    stringsOrPipes: str
    bridgeType: str

class Instrument(BaseModel):
    id: str
    name: str
    sanskritName: str
    regionalNames: List[str]
    family: InstrumentFamily
    categoryLabel: str
    era: str
    period: HistoricalPeriod
    century: str
    region: str
    coordinates: Optional[Tuple[float, float]] = None
    status: ConservationStatus
    image: str
    carvingImage: Optional[str] = None
    shortDescription: str
    historicalContext: str
    constructionMaterials: List[MaterialComponent]
    playingTechnique: str
    culturalSignificance: str
    treatiseCitations: List[TreatiseCitation]
    acousticProfile: AcousticProfile
    playInterface: PlayInterfaceConfig
    detectionCues: DetectionCues
