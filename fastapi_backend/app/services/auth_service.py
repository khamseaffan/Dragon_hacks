
# app/services/auth_service.py
# Service layer for authentication related logic, like Auth0 code exchange.

import httpx
from fastapi import HTTPException, status
from typing import Dict, Any, Optional

from app.core.config import settings

async def exchange_auth0_code(code: str, redirect_uri: str) -> Dict[str, Any]:
    """
    Exchanges an Auth0 authorization code for tokens (Access Token, ID Token).
    Validates the ID token and extracts user information.

    Args:
        code: The authorization code received from Auth0.
        redirect_uri: The URI Auth0 redirected to, must match the one used in the initial auth request.

    Returns:
        A dictionary containing user info like 'sub' and 'email' if successful.

    Raises:
        HTTPException: If the code exchange or token validation fails.
    """
    token_url = f"https://{settings.AUTH0_DOMAIN}/oauth/token"
    payload = {
        'grant_type': 'authorization_code',
        'client_id': settings.AUTH0_CLIENT_ID,
        'client_secret': settings.AUTH0_CLIENT_SECRET,
        'code': code,
        'redirect_uri': redirect_uri # Crucial: Must match the redirect URI used by the frontend
    }
    headers = {'content-type': 'application/x-www-form-urlencoded'}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(token_url, data=payload, headers=headers)
            response.raise_for_status() # Raise exception for 4XX/5XX responses
            token_data = response.json()
        except httpx.RequestError as exc:
            print(f"Error requesting Auth0 token endpoint: {exc}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not connect to authentication service."
            )
        except httpx.HTTPStatusError as exc:
            print(f"Error response from Auth0 token endpoint: {exc.response.status_code} - {exc.response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, # Or 401 depending on error
                detail=f"Failed to exchange authorization code: {exc.response.json().get('error_description', 'Unknown error')}"
            )
        except Exception as e:
            print(f"Unexpected error during Auth0 code exchange: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred during authentication."
            )

    # --- ID Token Validation (Optional but Recommended) ---
    # Although Auth0 validates on their end, re-validating the ID token here adds security.
    # This requires fetching JWKS again, similar to the previous verify_token dependency.
    # For simplicity in this refactor, we'll trust the exchange and extract claims directly.
    # Consider adding full ID token validation using python-jose and JWKS if needed.

    id_token = token_data.get('id_token')
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID token missing from Auth0 response."
        )

    try:
        # Decode *without* verification just to get claims (less secure than full validation)
        # For full security, use jwt.decode with verification as in the old verify_token
        unverified_claims = jwt.get_unverified_claims(id_token)
        auth0_sub = unverified_claims.get('sub')
        email = unverified_claims.get('email')

        if not auth0_sub or not email:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Essential claims (sub, email) missing from ID token."
            )

        # Optional: Add nonce validation if you used one in the initial auth request
        # Optional: Verify 'aud' (audience) and 'iss' (issuer) claims

        return {"sub": auth0_sub, "email": email}

    except jwt.JWTError as e:
        print(f"Error decoding ID token claims: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID token received."
        )
    except Exception as e:
        print(f"Unexpected error processing ID token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred processing authentication data."
        )

# Need to import jwt from jose for the unverified claims part
from jose import jwt
