from fastapi import APIRouter
from ..models.rag import RAGQueryRequest, RAGQueryResponse
from ..services.rag_service import rag_service
from ..services.database_service import db_service

router = APIRouter(prefix="/rag", tags=["Historical Treatises RAG"])

@router.post("/query", response_model=RAGQueryResponse)
def query_treatises(req: RAGQueryRequest):
    return rag_service.search_treatises(req.query)

@router.get("/treatises")
def list_treatises():
    return db_service.treatises
