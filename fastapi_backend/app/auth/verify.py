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
# Ensure Auth0 settings are loaded correctly
AUTH0_DOMAIN = getattr(settings, 'AUTH0_DOMAIN', None)
API_AUDIENCE = getattr(settings, 'AUTH0_API_AUDIENCE', None)

if not AUTH0_DOMAIN or not API_AUDIENCE:
    print("\033[91mERROR: AUTH0_DOMAIN or AUTH0_API_AUDIENCE not configured in settings! Token verification will fail.\033[0m")
    # Optionally raise an error here to prevent startup without config
    # raise ValueError("Auth0 Domain and API Audience must be configured")

ISSUER = f"https://{AUTH0_DOMAIN}/" if AUTH0_DOMAIN else None
JWKS_URL = f"{ISSUER}.well-known/jwks.json" if ISSUER else None

# --- JWKS Caching ---
jwks_cache = TTLCache(maxsize=1, ttl=600)

# --- HTTP Bearer Scheme ---
token_auth_scheme = HTTPBearer()

# --- Helper Functions ---
async def get_jwks() -> Dict[str, Any]:
    """Fetches JWKS from Auth0, using a cache."""
    if not JWKS_URL:
        raise HTTPException(status_code=500, detail="Auth0 configuration missing, cannot fetch JWKS.")

    cached_jwks = jwks_cache.get("jwks")
    if cached_jwks:
        return cached_jwks

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(JWKS_URL)
            response.raise_for_status()
            jwks = response.json()
            jwks_cache["jwks"] = jwks
            return jwks
        except Exception as e:
            print(f"Failed to fetch JWKS: {e}")
            raise HTTPException(status_code=503, detail="Could not fetch JWKS from authentication provider.")

# --- FastAPI Dependency ---
async def verify_token(token: HTTPAuthorizationCredentials = Depends(token_auth_scheme)) -> Dict[str, Any]:
    """
    FastAPI dependency to verify the Auth0 JWT token.
    """
    if not AUTH0_DOMAIN or not API_AUDIENCE or not ISSUER:
         raise HTTPException(status_code=500, detail="Auth0 configuration missing for token verification.")

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

        for key in jwks.get("keys", []):
            if key.get("kid") == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break

        if not rsa_key:
            raise credentials_exception

        payload = jwt.decode(
            token.credentials,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE, # Re-enable audience validation
            issuer=ISSUER # Validate issuer
        )
        return payload

    except jose_exceptions.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired", headers={"WWW-Authenticate": "Bearer"})
    except jose_exceptions.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Incorrect claims, check audience/issuer", headers={"WWW-Authenticate": "Bearer"})
    except jose_exceptions.JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {e}", headers={"WWW-Authenticate": "Bearer"})
    except HTTPException as e:
        raise e # Re-raise specific HTTP exceptions (like from get_jwks)
    except Exception as e:
        print(f"Unexpected error during token verification: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during token validation")

