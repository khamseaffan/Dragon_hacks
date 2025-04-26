
# app/schemas/user_schemas.py
# Pydantic models for user-related request/response validation.

from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    user_id: str # Typically the Auth0 sub

class UserResponse(UserBase):
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # For Pydantic V2 (replaces orm_mode)
        # orm_mode = True # For Pydantic V1
