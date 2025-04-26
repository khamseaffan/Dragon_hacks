# app/models/user_model.py
# Defines the User document model for MongoDB using Beanie.

from beanie import Document, Indexed
from pydantic import Field, EmailStr
from datetime import datetime
from typing import Optional, Annotated # Import Annotated
from pymongo import IndexModel # Import IndexModel for creating indexes

class User(Document):
    """Represents a user in the database."""
    # Use Annotated for indexing in Pydantic v2 / modern Beanie
    user_id: Annotated[str, Indexed(unique=True)] # Corresponds to Auth0 'sub'
    email: EmailStr
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # Add other user-specific fields as needed, e.g., name, preferences

    class Settings:
        name = "users" # MongoDB collection name
        # Optional: Define indexes explicitly if needed beyond simple Indexed annotation
        # indexes = [
        #     IndexModel([("user_id", 1)], unique=True),
        #     IndexModel([("email", 1)], unique=False), # Example: if you want to index email
        # ]
