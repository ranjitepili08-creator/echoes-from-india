# Echoes of India (भारत की गूँज)
### *Reviving the Sound of Historical Indian Instruments through AI*

An AI-powered platform and digital museum that brings the sound of India's historical, near-extinct, and rare musical instruments back to life.

> **Project Concept Prepared by**: Ranjeet  
> **Academic Program**: AI/ML Program — Masai School, in collaboration with IIT Patna  
> **Theoretical Grounding**: *Natya Shastra*, *Sangita Ratnakara*, *Silappadikaram*, *Kama Sutra*

---

## 🏛️ Directory Structure

```
echoes-from-india-main/
├── backend/                       # Python FastAPI Backend & AI Services
│   ├── app/
│   │   ├── api/                   # REST API routes (instruments, vision, rag, audio, songs)
│   │   ├── models/                # Pydantic data schemas
│   │   ├── services/              # Vision inference, Treatises RAG, Acoustic DSP
│   │   └── data/                  # Organological JSON databases
│   ├── tests/                     # Pytest suite (100% passing)
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Backend containerization
│
├── frontend/                      # React 19 + TypeScript + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── VisionScanner/     # AI photo upload, bounding boxes & neural feature scan
│   │   │   ├── KnowledgePanel/    # Historical dossier, regional map, ancient slokas
│   │   │   ├── VirtualPlayStudio/ # Tactile string/idiophone/drum studio + visualizer
│   │   │   ├── RhythmGame/        # Falling tiles rhythm game ("Piano Tiles" style)
│   │   │   ├── CulturalArchive/   # Searchable museum (Tata, Sushira, Avanaddha, Ghana)
│   │   │   └── KioskMode/         # Touchscreen exhibition kiosk with auto-tour
│   │   ├── services/              # Web Audio procedural synthesis & API client
│   │   └── types/                 # Shared TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts             # Proxies /api -> backend http://localhost:8000
│   └── Dockerfile                 # Frontend containerization
│
├── docs/                          # Architecture diagrams, API specs & organology guide
├── docker-compose.yml             # Single-command multi-container launch
├── start.sh                       # One-click fullstack launcher script
├── Makefile                       # Development & test automation tasks
└── README.md
```

---

## 🚀 Quick Start

### 1. Unified One-Click Launch (Frontend + Backend)
```bash
./start.sh
```
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000) (Interactive Swagger Docs at `/docs`)

### 2. Run with Docker Compose
```bash
docker-compose up --build
```

### 3. Run Services Separately

**Backend**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

**Run Backend Tests**:
```bash
backend/venv/bin/pytest backend/tests/
```

---

## 🎼 5-Stage Core Pipeline + Game Extension

1. **Image Upload & Capture**: Upload photos of museum exhibits, temple carvings, cave murals, or manuscripts.
2. **AI Vision Recognition**: Multimodal feature extraction (gourd resonators, Jivari bridges, string arrays, membrane heads) with confidence scoring.
3. **Historical Knowledge Panel**: Verified civilizational context, material science breakdown, and ancient Sanskrit & Tamil treatise citations.
4. **AI Acoustic Reconstruction**: Procedural Web Audio API physical modeling (*Jivari* buzzing dispersion, gourd cavity formants, silk/wire string impedance, hydro-acoustic porcelain damping, dual-head dough/syahi drum acoustics).
5. **Interactive Virtual Play Studio**: Tactile string strumming, *Meend* microtonal pitch bending, *Jal Tarang* water-level tuning, *Pakhawaj* bol pads with 12-beat Chautal Dhrupad loops, and live WAV recording.
6. **Interactive Rhythm Game Mode**: Falling-tile rhythm game ("Hear History Play a Familiar Tune") powered by reconstructed instrument soundfonts.

---

## 📜 Academic Attribution & Theoretical Grounding
- **Masai School × IIT Patna** AI/ML Collaborative Project
- **Primary Musicological Treatises**:
  - *Natya Shastra* by Bharata Muni (c. 200 BCE – 200 CE)
  - *Sangita Ratnakara* by Sharngadeva (13th Century CE)
  - *Silappadikaram* by Ilango Adigal (c. 2nd – 5th Century CE)
  - *Kama Sutra* (Udaka Vadya / 64 Kalas) by Vatsyayana
