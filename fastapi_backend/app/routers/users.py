
# app/routers/users.py
# API endpoints for user-related operations.

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr
from typing import Dict, Any

from app.auth.verify import verify_token
from app.models.user_model import User
from app.schemas.user_schemas import UserResponse

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/me", response_model=UserResponse)
async def get_current_user(payload: Dict[str, Any] = Depends(verify_token)) -> User:
    """
    Retrieves the profile for the currently authenticated user.
    If the user does not exist in the database, it creates a new user record
    based on the information from the Auth0 token.
    """
    user_id = payload.get("sub")
    # Attempt to get email from standard claim, fallback to custom if needed
    email_claim = payload.get("email") or payload.get(f"https://{settings.AUTH0_DOMAIN}/email")

    if not user_id:
        # This should technically not happen if verify_token works correctly
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID (sub) from token."
        )

    if not email_claim:
         # If email is crucial and not found, raise an error or handle accordingly
         # Depending on Auth0 setup, email might not always be in the access token
         # Consider fetching from /userinfo endpoint if needed and not present
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract email from token. Ensure email scope is requested."
        )

    try:
        # Check if user exists
        user = await User.find_one(User.user_id == user_id)

        if user is None:
            print(f"User {user_id} not found, creating new user.")
            # User does not exist, create them
            new_user = User(
                user_id=user_id,
                email=EmailStr(email_claim) # Validate email format
            )
            await new_user.insert()
            print(f"User {user_id} created successfully.")
            user = new_user
        else:
            print(f"User {user_id} found.")
            # Optionally update email if it changed in Auth0? Requires careful consideration.
            # if user.email != email_claim:
            #     user.email = EmailStr(email_claim)
            #     user.updated_at = datetime.utcnow()
            #     await user.save()

        # Return the found or newly created user object.
        # FastAPI handles serialization via UserResponse response_model.
        return user

    except Exception as e:
        # Catch potential database errors or other issues
        print(f"Error in /users/me endpoint for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving or creating the user profile."
        )

