from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..models.instrument import Instrument
from ..services.database_service import db_service

router = APIRouter(prefix="/instruments", tags=["Instruments"])

@router.get("", response_model=List[Instrument])
def list_instruments(
    family: Optional[str] = Query(None, description="Filter by Natya Shastra family (tata, sushira, avanaddha, ghana)"),
    status: Optional[str] = Query(None, description="Filter by status (extinct, rare, living)"),
    period: Optional[str] = Query(None, description="Filter by historical era"),
    search: Optional[str] = Query(None, description="Search term in name or description")
):
    results = db_service.get_all_instruments()
    
    if family:
        results = [i for i in results if i.family == family]
    if status:
        results = [i for i in results if i.status == status]
    if period:
        results = [i for i in results if i.period == period]
    if search:
        s = search.lower()
        results = [i for i in results if s in i.name.lower() or s in i.sanskritName.lower() or s in i.region.lower() or any(s in m.lower() for m in i.museums)]
        
    return results

@router.get("/{instrument_id}", response_model=Instrument)
def get_instrument(instrument_id: str):
    inst = db_service.get_instrument_by_id(instrument_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return inst

@router.post("", response_model=Instrument)
def create_instrument(instrument: Instrument):
    return db_service.add_instrument(instrument)
