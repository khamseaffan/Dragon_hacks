from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import date

class UserDataRequest(BaseModel):
    """User data from frontend for simplified authentication"""
    email: Optional[str] = None
    name: Optional[str] = None
    user_id: Optional[str] = None # Typically Auth0 sub
    picture: Optional[str] = None

class LinkTokenResponse(BaseModel):
    link_token: str

class AccessTokenResponse(BaseModel):
    # access_token: str # Avoid sending access token back to frontend
    item_id: str
    message: Optional[str] = "Item successfully created"

class GetTransactionsRequest(BaseModel):
    # access_token: str # Access token should be retrieved on backend based on item_id/user
    start_date: date = Field(..., description="Start date for transactions in YYYY-MM-DD format")
    end_date: date = Field(..., description="End date for transactions in YYYY-MM-DD format")
    min_transactions: Optional[int] = Field(70, description="Minimum number of transactions to return (sandbox only)")
    max_transactions: Optional[int] = Field(100, description="Maximum number of transactions to return (sandbox only)")
    user_data: Optional[UserDataRequest] = None # Pass user info if needed for dev mode

class TransactionsResponse(BaseModel):
    transactions: List[Any]
    total_transactions: Optional[int] = None
