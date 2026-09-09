# REST API Specifications

Base URL: `/api/v1`

## Endpoints

### 1. Instruments
- `GET /instruments`: Query instruments with optional filters (`family`, `status`, `period`, `search`).
- `GET /instruments/{id}`: Retrieve full organological and historical profile for an instrument.
- `POST /instruments`: Add a new instrument to the archive.

### 2. AI Vision Recognition
- `POST /vision/classify`:
  - Request: `{ "image_data": "data:image/jpeg;base64,...", "forced_instrument_id": "yazh" }`
  - Response: `{ "instrument": {...}, "confidence": 96, "detectedFeatures": [...], "analysisNotes": [...] }`

### 3. Historical Treatises RAG
- `POST /rag/query`:
  - Request: `{ "query": "silk strings ancient tamil harp" }`
  - Response: `{ "citations": [...], "summary": "...", "relevance_score": 0.96 }`
- `GET /rag/treatises`: List all canonical Sanskrit and Tamil musicological treatises.

### 4. Acoustic Sound Reconstruction
- `POST /audio/synthesize-params`:
  - Request: `{ "instrument_id": "rudra-veena" }`
  - Response: `{ "timbre_type": "plucked_wire", "resonator_frequency_hz": 95, "jawari_buzz_intensity": 0.85, ... }`

### 5. Rhythm Game Songs
- `GET /songs`: List all public-domain melody charts (Raga Bhupali, Vande Mataram, etc.).
- `GET /songs/{id}`: Retrieve note timings, sargam mappings, and lanes for a specific song.

### 6. Archive Statistics
- `GET /archive/stats`: Return total count, extinction status distribution, and treatise metrics.
