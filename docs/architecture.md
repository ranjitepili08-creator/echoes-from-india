# Echoes of India - System Architecture

Echoes of India is a multi-tier platform combining Computer Vision, Organological Retrieval (RAG), and Web Audio synthesis.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  React 19 + TypeScript + Vite + TailwindCSS + Tone.js / Web Audio API             |
|                                                                                   |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  | AI Vision Scanner |  | Historical Panel  |  | Virtual Play Studio            | |
|  | (Upload/Camera)   |  | (Dossier & Treat.)|  | (Strumming, Meend, Visualizer) | |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  | Rhythm Game Mode  |  | Cultural Archive  |  | Museum Touch Kiosk             | |
|  | (Falling Tiles)   |  | (Digital Museum)  |  | (Auto-Tour & Large Display)    | |
|  +-------------------+  +-------------------+  +--------------------------------+ |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                                  BACKEND LAYER                                    |
|  Python 3.11+ / FastAPI Microservices                                             |
|                                                                                   |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  | /vision/classify  |  | /rag/query        |  | /audio/synthesize-params       | |
|  | (Feature extract) |  | (Natya Shastra)   |  | (Cavity & Jivari DSP)          | |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  | /instruments      |  | /songs            |  | /archive/stats                 | |
|  | (CRUD & Query)    |  | (Rhythm Charts)   |  | (Museum Metrics)               | |
|  +-------------------+  +-------------------+  +--------------------------------+ |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                DATA & KNOWLEDGE                                   |
|  - Natya Shastra, Sangita Ratnakara, Silappadikaram Corpus                        |
|  - Organological Physical Acoustic Models (Jivari buzz, cavity formants)          |
|  - Public-Domain Indian Classical Heritage Song Charts                            |
+-----------------------------------------------------------------------------------+
```
