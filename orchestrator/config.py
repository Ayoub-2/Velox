from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application Configuration
    Validates environment variables at startup.
    """
    APP_NAME: str = "Velox Orchestrator"
    API_V1_STR: str = "/api/v1"
    
    # Security
    API_KEY: str = "change_me_in_prod"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Infrastructure
    REDIS_URL: str = "redis://redis:6379/0"
    ZAP_URL: str = "http://zap:8090"
    
    # Tool Paths
    NUCLEI_PATH: str = "/usr/local/bin/nuclei"
    
    class Config:
        env_file = ".env"

settings = Settings()
