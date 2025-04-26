
# app/auth/verify.py
# Handles Auth0 JWT verification.

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, exceptions as jose_exceptions
from cachetools import TTLCache
from typing import Dict, Any

from app.core.config import settings

# --- Constants ---
ALGORITHMS = ["RS256"]
AUTH0_DOMAIN = settings.AUTH0_DOMAIN
API_AUDIENCE = settings.AUTH0_API_AUDIENCE
ISSUER = f"https://{AUTH0_DOMAIN}/"
JWKS_URL = f"{ISSUER}.well-known/jwks.json"

# --- JWKS Caching ---
# Cache JWKS for 10 minutes to avoid excessive requests
jwks_cache = TTLCache(maxsize=1, ttl=600)

# --- HTTP Bearer Scheme ---
# Reusable HTTPBearer instance
token_auth_scheme = HTTPBearer()

# --- Helper Functions ---
async def get_jwks() -> Dict[str, Any]:
    """Fetches JWKS from Auth0, using a cache."""
    cached_jwks = jwks_cache.get("jwks")
    if cached_jwks:
        return cached_jwks

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(JWKS_URL)
            response.raise_for_status() # Raise exception for 4XX/5XX responses
            jwks = response.json()
            jwks_cache["jwks"] = jwks # Store in cache
            return jwks
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Error requesting JWKS: {exc}"
            )
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Error response from JWKS endpoint: {exc.response.status_code}"
            )
        except Exception as e: # Catch potential JSON decoding errors or others
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch or process JWKS: {e}"
            )


# --- FastAPI Dependency ---
async def verify_token(
    token: HTTPAuthorizationCredentials = Depends(token_auth_scheme)
) -> Dict[str, Any]:
    """
    FastAPI dependency to verify the Auth0 JWT token.

    Args:
        token: The HTTPAuthorizationCredentials containing the bearer token.

    Returns:
        The decoded token payload (claims) if valid.

    Raises:
        HTTPException: 401 Unauthorized for various token errors (missing, invalid, expired, etc.).
                       503 Service Unavailable if JWKS cannot be fetched.
    """
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        jwks = await get_jwks()
        unverified_header = jwt.get_unverified_header(token.credentials)
        rsa_key = {}
        if "kid" not in unverified_header:
            raise credentials_exception

        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break # Found the key

        if not rsa_key:
            raise credentials_exception # Unable to find appropriate key

        payload = jwt.decode(
            token.credentials,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer=ISSUER
        )
        return payload

    except jose_exceptions.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jose_exceptions.JWTClaimsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect claims, please check the audience and issuer",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jose_exceptions.JWTError as e:
        # Catch other JWT errors (e.g., invalid signature, format issues)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unable to parse authentication token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException as e:
        # Re-raise HTTPExceptions from get_jwks or credential checks
        raise e
    except Exception as e:
        # Catch any other unexpected errors during validation
        print(f"Unexpected error during token verification: {e}") # Log for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during token validation",
        )

