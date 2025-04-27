import json  # required for custom item endpoint
from fastapi import APIRouter, HTTPException, status, Body, Path
from app.services.plaid_service import PlaidService
from app.models.plaid_item_model import PlaidItem
from typing import List, Any, Dict
from plaid.model.products import Products
from app.schemas.plaid_schemas import (
    LinkTokenResponse,
    AccessTokenResponse,
    GetTransactionsRequest,
    TransactionsResponse,
    UserDataRequest,
)
from app.utils.encryption import encrypt_token, decrypt_token
from datetime import datetime, date, timedelta

# Initialize router and service
router = APIRouter(
    tags=["Plaid"],
)
plaid_service = PlaidService()

@router.post("/create_link_token", response_model=LinkTokenResponse)
async def create_link_token(request: UserDataRequest = None):
    """Creates a Plaid Link token. No backend auth required."""
    # Use user data sent from frontend or generate dev ID
    user_id = request.user_id if request and request.user_id else get_dev_user_id(
        request.email if request and request.email else None
    )
    print(f"Creating link token for user: {user_id}")
    link_token = await plaid_service.create_link_token(user_id)
    return LinkTokenResponse(link_token=link_token)

@router.post("/exchange_public_token", response_model=AccessTokenResponse)
async def exchange_public_token(payload: dict = Body(...)):
    """Exchanges public token. No backend auth required."""
    print(f"Exchange public token request payload: {payload}")
    public_token = payload.get("public_token")
    if not public_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing public_token")
    # Get user_id from payload or generate dev ID
    email = payload.get("email")
    user_id = payload.get("user_id") or get_dev_user_id(email)

    access_token, item_id = await plaid_service.exchange_public_token(public_token)
    encrypted_access_token = encrypt_token(access_token)
    existing_item = await PlaidItem.find_one(PlaidItem.item_id == item_id)
    if existing_item:
        existing_item.access_token = encrypted_access_token
        existing_item.updated_at = datetime.utcnow()
        await existing_item.save()
    else:
        new_item = PlaidItem(
            item_id=item_id,
            user_id=user_id,
            access_token=encrypted_access_token,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        await new_item.insert()
    return AccessTokenResponse(access_token=access_token, item_id=item_id)

@router.post("/items/{item_id}/transactions", response_model=TransactionsResponse)
async def get_transactions(item_id: str = Path(...), request: GetTransactionsRequest = Body(...)):
    """Fetches transactions. No backend auth required (relies on item_id ownership implicitly)."""
    # Fetch the Plaid Item - anyone can fetch if they know the ID in this simplified model
    plaid_item = await PlaidItem.find_one(PlaidItem.item_id == item_id)
    if not plaid_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plaid item not found or access denied")

    # Decrypt access token and fetch transactions
    access_token = decrypt_token(plaid_item.access_token)
    transactions = await plaid_service.get_transactions(
        access_token, request.start_date, request.end_date,
        min_count=request.min_transactions,
        max_count=request.max_transactions
    )
    return TransactionsResponse(transactions=transactions)

# Custom sandbox item endpoint
@router.post("/create_custom_item")
async def create_custom_item():
    """
    Generate a Plaid Sandbox public token for a new item seeded with custom transaction history.
    Reads transaction data from custom_gig_user.json and uses Plaid's override_history option.
    """
    # Correct path relative to the project root (where uvicorn usually runs)
    json_path = "app/db/custom_gig_user.json"
    try:
        # WARNING: The structure of objects in custom_gig_user.json MUST match Plaid's override_history requirements.
        # See: https://plaid.com/docs/api/sandbox/#sandboxpublictokencreate-request
        with open(json_path, "r") as f:
            transactions_data = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {json_path}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON in {json_path}: {str(e)}")

    if not isinstance(transactions_data, list):
        raise HTTPException(status_code=400, detail="custom_gig_user.json must contain a list of transaction objects.")

    institution_id = "ins_109508"  # Plaid Test Bank
    initial_products = [Products("transactions")]

    try:
        public_token = await plaid_service.create_sandbox_custom_item(
            institution_id, initial_products, transactions_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create sandbox item: {str(e)}")

    return {"public_token": public_token}