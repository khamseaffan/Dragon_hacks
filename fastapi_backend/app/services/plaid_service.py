import plaid
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException, status
from plaid.api import plaid_api
from plaid.model.products import Products
from app.core.config import settings
from plaid import ApiClient, Configuration  # removed Environment import
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.link_token_create_request_update import LinkTokenCreateRequestUpdate
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
from plaid.model.sandbox_public_token_create_request_options import SandboxPublicTokenCreateRequestOptions
import random
from datetime import date


class PlaidService:
    def __init__(self):
        # Initialize Plaid API client based on configured environment
        plaid_env_setting = settings.PLAID_ENV # e.g., "sandbox"
        print(f"[PlaidService Init] PLAID_ENV from settings: '{plaid_env_setting}'")

        # Determine the Plaid host URL directly from the setting string
        if plaid_env_setting == "development":
            plaid_host_url = "https://development.plaid.com"
        elif plaid_env_setting == "production":
            plaid_host_url = "https://production.plaid.com"
        else: # Default to sandbox
            if plaid_env_setting != "sandbox":
                 print(f"[PlaidService Init] Warning: Unknown PLAID_ENV '{plaid_env_setting}'. Defaulting to Sandbox URL.")
            plaid_host_url = "https://sandbox.plaid.com"

        print(f"[PlaidService Init] Using Plaid host URL: {plaid_host_url}")

        configuration = Configuration(
            host=plaid_host_url, # Pass the URL string directly
            api_key={
                'clientId': settings.PLAID_CLIENT_ID,
                'secret': settings.PLAID_SECRET_KEY
            }
        )
        api_client = ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)
        print(f"Plaid client initialized successfully for environment: {settings.PLAID_ENV} -> {plaid_host_url}")

    async def create_link_token(self, user_id: str) -> str:
        try:
            request = LinkTokenCreateRequest(
                user=LinkTokenCreateRequestUser(client_user_id=user_id),
                client_name="DragonHacks Finance App",
                products=[Products("transactions")],
                country_codes=[CountryCode("US")],
                language="en",
            )
            response = self.client.link_token_create(request)
            return response.link_token
        except plaid.ApiException as e:
            if e.status == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Plaid API error: {e.body}"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Plaid service error: {e.body}"
                )

    async def create_update_link_token(self, user_id: str, access_token: str) -> str:
        try:
            request = LinkTokenCreateRequest(
                user=LinkTokenCreateRequestUser(client_user_id=user_id),
                client_name="DragonHacks Finance App",
                country_codes=[CountryCode("US")],
                language="en",
                access_token=access_token,
                update=LinkTokenCreateRequestUpdate()
            )
            response = self.client.link_token_create(request)
            return response.link_token
        except plaid.ApiException as e:
            if e.status == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Plaid API error: {e.body}"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Plaid service error: {e.body}"
                )

    async def exchange_public_token(self, public_token: str) -> Tuple[str, str]:
        try:
            request = ItemPublicTokenExchangeRequest(public_token=public_token)
            response = self.client.item_public_token_exchange(request)
            return response.access_token, response.item_id
        except plaid.ApiException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Plaid API error: {e.body}"
            )

    async def get_transactions(self, access_token: str, start_date: date, end_date: date,
                               min_count: int = 70, max_count: int = 100) -> List[Dict[str, Any]]:
        try:
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date,
                options=TransactionsGetRequestOptions(count=max_count)
            )
            response = self.client.transactions_get(request)
            transactions = response.transactions
            if settings.PLAID_ENV.lower() == 'sandbox' and len(transactions) >= min_count:
                if len(transactions) > max_count:
                    count = random.randint(min_count, max_count)
                    transactions = random.sample(transactions, count)
            return [t.to_dict() for t in transactions]
        except plaid.ApiException as e:
            detail = e.body.get('error_message') if isinstance(e.body, dict) else str(e.body)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Plaid API error: {detail}"
            )

    async def create_sandbox_custom_item(self, institution_id: str, initial_products: List[Products], transaction_history: List[dict]) -> str:
        """
        Create a Plaid Sandbox public token for a new item seeded with custom transaction history.
        Uses the /sandbox/public_token/create endpoint and override_history option.
        """
        options = SandboxPublicTokenCreateRequestOptions(
            override_history=transaction_history,
            override_username="user_custom_gig"  # You can customize this username
        )
        request = SandboxPublicTokenCreateRequest(
            institution_id=institution_id,
            initial_products=initial_products,
            options=options
        )
        try:
            response = self.client.sandbox_public_token_create(request)
            public_token = response.public_token
            print(f"Created sandbox public token with custom history for institution {institution_id}")
            return public_token
        except plaid.ApiException as e:
            print(f"Error creating sandbox public token with custom history: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Plaid API error: {e.body}"
            )