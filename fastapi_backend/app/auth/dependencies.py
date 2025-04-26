
# app/auth/dependencies.py
# FastAPI dependencies for authentication, e.g., getting user from session cookie.

from fastapi import Request, Depends, HTTPException, status
from typing import Optional

from app.models.user_model import User
from app.utils import jwt_utils

async def get_current_user_from_cookie(request: Request) -> User:
    """
    FastAPI dependency to retrieve the current user based on the session JWT
    stored in an HTTP-Only cookie.

    Args:
        request: The incoming FastAPI request object.

    Returns:
        The authenticated User object if the session token is valid and the user exists.

    Raises:
        HTTPException 401: If the cookie is missing, the token is invalid/expired,
                           or the user associated with the token is not found.
    """
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Session cookie missing.",
            headers={"WWW-Authenticate": "Bearer"}, # Or a custom scheme?
        )

    try:
        payload = jwt_utils.decode_session_jwt(token)
        if payload is None: # Should be handled by decode_session_jwt raising exception, but double-check
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: Subject missing")

        # Fetch user from database
        user = await User.find_one(User.user_id == user_id)
        if user is None:
            # This could happen if the user was deleted after the token was issued
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return user

    except HTTPException as e:
        # Re-raise exceptions from decode_session_jwt or user not found
        # Potentially clear the invalid cookie here?
        # response = Response(status_code=e.status_code, headers=e.headers)
        # response.delete_cookie("session_token", httponly=True, secure=True, samesite="lax")
        # raise HTTPException(status_code=e.status_code, detail=e.detail, headers=e.headers)
        raise e # Re-raise for now
    except Exception as e:
        print(f"Unexpected error getting user from cookie: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process authentication."
        )

# Optional: Dependency to get user or None (for optional authentication)
async def get_optional_current_user(request: Request) -> Optional[User]:
    try:
        return await get_current_user_from_cookie(request)
    except HTTPException as e:
        # If it's specifically a 401, return None, otherwise re-raise
        if e.status_code == status.HTTP_401_UNAUTHORIZED:
            return None
        raise e
