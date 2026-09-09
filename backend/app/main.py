from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="REST API & AI Pipelines for Echoes of India - Historical Musical Instrument Revival (Masai School × IIT Patna)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Echoes of India API",
        "docs": "/docs",
        "health": "/health",
        "version": settings.VERSION
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Echoes of India Backend",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
