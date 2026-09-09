from fastapi import APIRouter
from ..services.database_service import db_service

router = APIRouter(prefix="/archive", tags=["Cultural Archive"])

@router.get("/stats")
def get_archive_stats():
    instruments = db_service.get_all_instruments()
    return {
        "total_instruments": len(instruments),
        "extinct_count": len([i for i in instruments if i.status == "extinct"]),
        "rare_count": len([i for i in instruments if i.status == "rare"]),
        "living_count": len([i for i in instruments if i.status == "living"]),
        "treatises_count": len(db_service.treatises),
        "songs_count": len(db_service.songs)
    }
