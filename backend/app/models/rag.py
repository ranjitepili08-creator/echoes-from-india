from typing import List, Optional
from pydantic import BaseModel
from .instrument import TreatiseCitation

class RAGQueryRequest(BaseModel):
    query: str
    filter_instrument_id: Optional[str] = None
    filter_treatise: Optional[str] = None

class RAGQueryResponse(BaseModel):
    query: str
    citations: List[TreatiseCitation]
    summary: str
    relevance_score: float = 0.95
