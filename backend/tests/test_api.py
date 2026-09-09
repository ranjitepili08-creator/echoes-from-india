import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_list_instruments():
    response = client.get("/api/v1/instruments")
    assert response.status_code == 200
    instruments = response.json()
    assert len(instruments) > 0
    assert any(i["id"] == "yazh" for i in instruments)

def test_get_instrument_by_id():
    response = client.get("/api/v1/instruments/yazh")
    assert response.status_code == 200
    inst = response.json()
    assert inst["id"] == "yazh"
    assert "Tata Vadya" in inst["categoryLabel"]

def test_vision_classification():
    response = client.post("/api/v1/vision/classify", json={
        "image_data": "data:image/jpeg;base64,mock",
        "forced_instrument_id": "yazh"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["instrument"]["id"] == "yazh"
    assert data["confidence"] >= 80

def test_rag_query():
    response = client.post("/api/v1/rag/query", json={"query": "yazh silk strings"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["citations"]) > 0

def test_audio_synthesize_params():
    response = client.post("/api/v1/audio/synthesize-params", json={
        "instrument_id": "rudra-veena"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["timbre_type"] == "plucked_wire"
    assert data["resonator_frequency_hz"] > 0

def test_list_songs():
    response = client.get("/api/v1/songs")
    assert response.status_code == 200
    songs = response.json()
    assert len(songs) > 0

def test_archive_stats():
    response = client.get("/api/v1/archive/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_instruments"] > 0
