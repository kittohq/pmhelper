from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "PM Helper"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    SECRET_KEY: str
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL: int = 3600
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # LLM Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_LLM_PROVIDER: str = "openai"
    DEFAULT_LLM_MODEL: str = "gpt-4"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 2000
    
    # Document Settings
    MAX_DOCUMENT_SIZE_MB: int = 10
    SUPPORTED_FORMATS: List[str] = ["md", "pdf", "docx"]
    
    # Storage
    STORAGE_BACKEND: str = "local"  # local, s3
    STORAGE_PATH: str = "./storage"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Voice
    WHISPER_MODEL: str = "base"
    ENABLE_VOICE_INTERFACE: bool = True
    
    # Inkeep Integration
    INKEEP_API_KEY: Optional[str] = None
    INKEEP_INTEGRATION_ID: Optional[str] = None
    INKEEP_API_URL: str = "https://api.inkeep.com"
    INKEEP_INDEX_ON_CREATE: bool = True
    INKEEP_ENABLE_CHAT: bool = True
    INKEEP_ENABLE_SEARCH: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()