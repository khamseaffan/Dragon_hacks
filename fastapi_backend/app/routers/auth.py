
# app/routers/auth.py
# API endpoints for session-based authentication (login/logout).

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, HttpUrl
from pydantic import EmailStr

from app.core.config import settings
from app.models.user_model import User
from app.schemas.user_schemas import UserResponse
from app.services import auth_service # Assuming __init__.py exports the service
from app.utils import jwt_utils
# Consider moving user find/create logic to a user_service
# from app.services import user_service

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

class AuthCode(BaseModel):
    authorization_code: str = Field(..., alias="authorizationCode")
    # The redirect URI used by the frontend when initiating the Auth0 login
    # This MUST match the redirect_uri sent in the /authorize request
    redirect_uri: HttpUrl = Field(..., alias="redirectUri")

class LoginResponse(BaseModel):
    user: UserResponse
    message: str = "Login successful"

@router.post("/login", response_model=LoginResponse)
async def login_for_session(auth_code: AuthCode, response: Response):
    """
    Handles the final step of Auth0 login.
    Receives an authorization code, exchanges it for tokens server-side,
    finds or creates the user in the local DB, creates a session JWT,
    and sets it in an HTTP-Only cookie.
    """
    try:
        # 1. Exchange Auth0 code for tokens and get user info
        user_info = await auth_service.exchange_auth0_code(
            code=auth_code.authorization_code,
            redirect_uri=str(auth_code.redirect_uri) # Convert HttpUrl to string
        )
        auth0_sub = user_info['sub']
        email = user_info['email']

        # 2. Find or create user in local database
        # TODO: Refactor this logic into user_service.get_or_create_user(auth0_sub, email)
        user = await User.find_one(User.user_id == auth0_sub)
        if user is None:
            print(f"User {auth0_sub} not found, creating new user.")
            user = User(user_id=auth0_sub, email=EmailStr(email))
            await user.insert()
            print(f"User {auth0_sub} created successfully.")
        else:
            print(f"User {auth0_sub} found.")
            # Optional: Update email if changed?

        # 3. Create session JWT
        session_data = {"sub": user.user_id} # Use our internal user ID if different, or Auth0 sub
        session_jwt = jwt_utils.create_session_jwt(data=session_data)

        # 4. Set JWT in HTTP-Only cookie
        response.set_cookie(
            key="session_token",
            value=session_jwt,
            httponly=True,
            secure=True,  # Set to True in production (requires HTTPS)
            samesite="lax", # Or "strict"
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/" # Cookie accessible for all paths
        )

        # 5. Return user info in response body
        return LoginResponse(user=UserResponse.model_validate(user)) # Use model_validate for Pydantic v2

    except HTTPException as e:
        # Re-raise HTTPExceptions from auth_service or user creation
        raise e
    except Exception as e:
        print(f"Error during login process: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during login."
        )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """
    Logs the user out by clearing the session cookie.
    """
    print("Logging out, clearing session cookie.")
    response.delete_cookie(
        key="session_token",
        httponly=True,
        secure=True, # Match settings used in set_cookie
        samesite="lax" # Match settings used in set_cookie
    )
    return {"message": "Logout successful"}

