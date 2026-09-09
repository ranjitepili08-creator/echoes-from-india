from typing import List
from fastapi import APIRouter, HTTPException
from ..models.song import SongChart
from ..services.database_service import db_service

router = APIRouter(prefix="/songs", tags=["Rhythm Game Songs"])

@router.get("", response_model=List[SongChart])
def list_songs():
    return db_service.get_all_songs()

@router.get("/{song_id}", response_model=SongChart)
def get_song(song_id: str):
    song = db_service.get_song_by_id(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song chart not found")
    return song
