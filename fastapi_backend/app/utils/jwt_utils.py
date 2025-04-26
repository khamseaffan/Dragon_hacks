
# app/utils/jwt_utils.py
# Utility functions for creating and decoding session JWTs.

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from jose import jwt, JWTError
from fastapi import HTTPException, status

from app.core.config import settings

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def create_session_jwt(data: dict) -> str:
    """Creates a session JWT containing the provided data."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_session_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes a session JWT.

    Args:
        token: The JWT string to decode.

    Returns:
        The decoded payload dictionary if valid and not expired.

    Raises:
        HTTPException 401: If the token is invalid, expired, or has incorrect claims.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}, # Keep Bearer for consistency? Or change?
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Optionally add more checks here, e.g., check for specific claims
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return payload
    except JWTError as e:
        print(f"JWT Decode Error: {e}") # Log the error
        raise credentials_exception
