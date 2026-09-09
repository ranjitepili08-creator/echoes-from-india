import json
from pathlib import Path
from typing import List, Optional
from ..models.instrument import Instrument
from ..models.song import SongChart
from ..config import settings

class DatabaseService:
    def __init__(self):
        self.instruments: List[Instrument] = []
        self.treatises: list = []
        self.songs: List[SongChart] = []
        self._load_data()

    def _load_data(self):
        inst_path = settings.DATA_DIR / "instruments.json"
        if inst_path.exists():
            with open(inst_path, "r", encoding="utf-8") as f:
                raw = json.load(f)
                self.instruments = [Instrument(**item) for item in raw]

        treatises_path = settings.DATA_DIR / "treatises.json"
        if treatises_path.exists():
            with open(treatises_path, "r", encoding="utf-8") as f:
                self.treatises = json.load(f)

        songs_path = settings.DATA_DIR / "songs.json"
        if songs_path.exists():
            with open(songs_path, "r", encoding="utf-8") as f:
                raw_songs = json.load(f)
                self.songs = [SongChart(**s) for s in raw_songs]

    def get_all_instruments(self) -> List[Instrument]:
        return self.instruments

    def get_instrument_by_id(self, inst_id: str) -> Optional[Instrument]:
        for inst in self.instruments:
            if inst.id == inst_id:
                return inst
        return None

    def add_instrument(self, inst: Instrument) -> Instrument:
        self.instruments.append(inst)
        return inst

    def get_all_songs(self) -> List[SongChart]:
        return self.songs

    def get_song_by_id(self, song_id: str) -> Optional[SongChart]:
        for s in self.songs:
            if s.id == song_id:
                return s
        return None

db_service = DatabaseService()
