# app/routers/users.py
# API endpoints for user-related operations.

from fastapi import APIRouter, HTTPException, status
from typing import Optional

from app.models.user_model import User
from app.schemas.user_schemas import UserResponse
from app.core.config import settings

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/me", response_model=Optional[UserResponse])
async def read_users_me():
    """
    Retrieves a placeholder user profile in dev mode.
    NOTE: In production, user info comes directly from Auth0 on the frontend.
    """
    # This endpoint is now primarily for dev/testing as frontend holds auth state
    if settings.DEV_MODE:
        # Return the hardcoded dev user info if in dev mode
        test_user_id = "dev-user-123"
        user = await User.find_one(User.user_id == test_user_id)
        if user:
            print(f"Returning dev user info for /me endpoint: {user.email}")
            return user
        else:
            # Optionally create the dev user if it doesn't exist
            print("Dev user not found in DB for /me endpoint.")
            return None
    else:
        # In production, this endpoint might not be needed or should be secured differently
        print("Accessing /me endpoint in non-dev mode - returning null.")
        return None

