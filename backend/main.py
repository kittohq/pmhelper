from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from api.routers import documents, workflows, generate, voice, auth, inkeep
from config.settings import settings
from utils.database import engine, Base
from utils.redis_client import redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    await redis_client.initialize()
    
    yield
    
    # Shutdown
    await redis_client.close()
    await engine.dispose()


app = FastAPI(
    title="PM Helper API",
    description="AI-powered Product Management Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["generation"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(inkeep.router, prefix="/api/v1/inkeep", tags=["inkeep"])


@app.get("/")
async def root():
    return {
        "message": "PM Helper API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "cache": "connected"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )