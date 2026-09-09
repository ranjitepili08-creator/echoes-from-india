from fastapi import APIRouter
from .instruments import router as instruments_router
from .vision import router as vision_router
from .rag import router as rag_router
from .audio import router as audio_router
from .songs import router as songs_router
from .archive import router as archive_router

api_router = APIRouter()
api_router.include_router(instruments_router)
api_router.include_router(vision_router)
api_router.include_router(rag_router)
api_router.include_router(audio_router)
api_router.include_router(songs_router)
api_router.include_router(archive_router)
