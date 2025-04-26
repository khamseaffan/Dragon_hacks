# app/models/plaid_item_model.py
# Defines the PlaidItem document model for MongoDB using Beanie.

from beanie import Document, Indexed # Keep Indexed for Annotated
from pydantic import Field
from datetime import datetime
from typing import Optional, Annotated # Import Annotated
from pymongo import IndexModel # Import IndexModel if defining indexes explicitly

class PlaidItem(Document):
    """Represents a Plaid Item linked to a user."""
    # Use Annotated for indexing
    item_id: Annotated[str, Indexed(unique=True)] # Plaid's unique identifier for the item
    user_id: Annotated[str, Indexed()] # Foreign key linking to User.user_id
    access_token: str # Encrypted Plaid access token
    institution_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # Add other relevant fields, e.g., last_sync_status, last_sync_time

    class Settings:
        name = "plaid_items" # MongoDB collection name
        # Optional: Define indexes explicitly
        # indexes = [
        #     IndexModel([("item_id", 1)], unique=True),
        #     IndexModel([("user_id", 1)], unique=False), # user_id is indexed but not unique across items
        # ]
