from typing import List, Literal
from pydantic import BaseModel

class SongNote(BaseModel):
    pitch: str
    sargam: str
    time: float
    duration: float
    lane: int

class SongChart(BaseModel):
    id: str
    title: str
    ragaOrOrigin: str
    description: str
    era: str
    bpm: int
    duration: float
    difficulty: Literal['Beginner', 'Intermediate', 'Virtuoso']
    notes: List[SongNote]
