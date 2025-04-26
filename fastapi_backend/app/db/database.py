import motor.motor_asyncio
from beanie import init_beanie
from app.core.config import settings
from app.models.user_model import User
from app.models.plaid_item_model import PlaidItem
# Import other models as they are created
# from app.models.budget_category_model import BudgetCategory

async def init_db():
    """Initializes the database connection and Beanie ODM."""
    print(f"Connecting to MongoDB at: {settings.DATABASE_URL}") # For debugging startup
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.DATABASE_URL
    )
    database = client["DragonHacks"] # Or client[DB_NAME] if not in URL

    # List all Beanie documents to initialize
    document_models = [
        User,
        PlaidItem,
        # BudgetCategory,
        # Add other models here
    ]

    await init_beanie(
        database=database,
        document_models=document_models
    )
    print("Beanie ODM initialized successfully.")