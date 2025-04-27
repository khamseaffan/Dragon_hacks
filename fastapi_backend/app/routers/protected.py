# app/routers/protected.py
# Example router with endpoints previously protected by Auth0 JWT verification.

from fastapi import APIRouter, status
from typing import Dict, Any

router = APIRouter()

@router.get("/private", status_code=status.HTTP_200_OK)
async def get_private_resource():
    """
    A previously protected endpoint. Now open or relies on frontend auth state.
    Returns placeholder data.
    """
    user_id = "unknown_user_no_backend_auth"
    return {"message": "Access granted to private resource.", "user_id": user_id}

@router.get("/private-scoped", status_code=status.HTTP_200_OK)
async def get_private_scoped_resource():
    """
    Another previously protected endpoint. Now open.
    """
    return {"message": "Access granted to scoped private resource.", "payload": {"info": "No token payload available"}}

