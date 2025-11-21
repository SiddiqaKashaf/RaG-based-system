from pydantic_settings import BaseSettings
from typing import List
import os

from pathlib import Path
from dotenv import load_dotenv

# Get the base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from the root directory
env_path = BASE_DIR / '.env'
print(f"Looking for .env file at: {env_path}")
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    # Database settings
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "fyp_db")
    
    # Construct database URL
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    # LLM / external model settings (Grok only)
    # Set to 'grok' to enable Grok-based synthesis, or leave empty to disable.
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "grok")
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    GROK_ENDPOINT: str = os.getenv("GROK_ENDPOINT", "")
    GROK_MODEL: str = os.getenv("GROK_MODEL", "llama-3.1-8b-instant")  # Default model (can be changed to grok-beta, mixtral-8x7b-32768, etc.)
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

    print("Connecting with user:", POSTGRES_USER)
    print("Password:", POSTGRES_PASSWORD)
    print("Host:", POSTGRES_HOST)
    print("Port:", POSTGRES_PORT)
    print("Database:", POSTGRES_DB)

settings = Settings() 

