
# app/routers/protected.py
# Example router with endpoints protected by Auth0 JWT verification.

from fastapi import APIRouter, Depends, status
from typing import Dict, Any

from app.auth.verify import verify_token

router = APIRouter()

@router.get("/private", status_code=status.HTTP_200_OK)
async def get_private_resource(payload: Dict[str, Any] = Depends(verify_token)):
    """
    A protected endpoint that requires a valid Auth0 JWT.
    Returns the user's Auth0 subject ID (sub) from the token payload.
    """
    user_id = payload.get("sub")
    return {"message": "Access granted to private resource.", "user_id": user_id}

@router.get("/private-scoped", status_code=status.HTTP_200_OK)
async def get_private_scoped_resource(payload: Dict[str, Any] = Depends(verify_token)):
    """
    Another protected endpoint. You would typically check for specific
    scopes/permissions within the payload here if needed.
    """
    # Example scope check (adjust 'read:messages' to your actual scope)
    # required_scope = "read:messages"
    # scopes = payload.get("scope", "").split()
    # if required_scope not in scopes:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail=f"Missing required scope: {required_scope}"
    #     )

    return {"message": "Access granted to scoped private resource.", "payload": payload}

