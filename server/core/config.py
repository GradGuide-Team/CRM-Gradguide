# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict 

class Settings(BaseSettings):
    # Project metadata
    PROJECT_NAME: str = "Gradguide CRM"
    PROJECT_VERSION: str = "1.0.0"

    # Database configuration
    DATABASE_URL: str 
    API_V1_STR: str = "/v1" 
    # JWT Settings
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int=60

    # Configuration for loading from .env file
    model_config = SettingsConfigDict(env_file=".env",extra="ignore")

settings = Settings()
