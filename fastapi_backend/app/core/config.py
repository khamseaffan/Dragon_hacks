# app/core/config.py
# Handles application configuration, primarily loading from environment variables.

from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Loads environment variables for the application."""
    DATABASE_URL: str = Field(..., env='DATABASE_URL')
    PLAID_CLIENT_ID: str = Field(..., env='PLAID_CLIENT_ID')
    PLAID_SECRET_KEY: str = Field(..., env='PLAID_SECRET_KEY')
    PLAID_ENV: str = Field('sandbox', env='PLAID_ENV') # e.g., 'sandbox', 'development', 'production'
    AUTH0_DOMAIN: str = Field(..., env='AUTH0_DOMAIN')
    AUTH0_API_AUDIENCE: str = Field(..., env='AUTH0_API_AUDIENCE')
    # Add other settings as needed, e.g., SECRET_KEY for encryption

    # Auth0 client settings
    AUTH0_CLIENT_ID: str = Field(..., env='AUTH0_CLIENT_ID')
    AUTH0_CLIENT_SECRET: str = Field(..., env='AUTH0_CLIENT_SECRET')
    # AUTH0_CALLBACK_URL: str = Field(..., env='AUTH0_CALLBACK_URL') # Needed if backend handles redirect directly

    # Session JWT Settings
    JWT_SECRET_KEY: str = Field(..., env='JWT_SECRET_KEY')
    JWT_ALGORITHM: str = Field("HS256", env='JWT_ALGORITHM')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env='ACCESS_TOKEN_EXPIRE_MINUTES')

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'
        extra = 'ignore' # Ignore extra fields from .env

# Create a single instance of the settings to be imported elsewhere
settings = Settings()
