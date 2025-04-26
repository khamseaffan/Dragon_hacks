# app/main.py
# Main FastAPI application instance and startup/shutdown logic.

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.database import init_db
from app.core.config import settings # Import settings if needed elsewhere, e.g., for CORS origins
# Import routers
# from app.routers import auth, plaid, budgets
from app.routers import protected, users # Import the users router

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    print("Application startup...")
    await init_db()
    yield
    # Code to run on shutdown
    print("Application shutdown...")
    # Add cleanup logic here if needed (e.g., close external connections)

app = FastAPI(
    title="My FastAPI Backend",
    description="API for managing personal finance data.",
    version="0.1.0",
    lifespan=lifespan # Use the lifespan context manager
)

# --- Middleware ---
# Example: CORS Middleware (adjust origins as needed)
# from fastapi.middleware.cors import CORSMiddleware
# origins = [
#     "http://localhost:3000", # Example frontend URL
#     # Add other allowed origins
# ]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# --- Routers ---
# Include routers from the app/routers directory
# app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router) # Add the users router (prefix is defined in the router itself)
# app.include_router(plaid.router, prefix="/plaid", tags=["Plaid"])
# app.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
app.include_router(protected.router, prefix="/api/v1", tags=["Protected"]) # Add the protected router

# --- Root Endpoint ---
@app.get("/")
async def read_root():
    """Root endpoint providing basic API information."""
    return {"message": "Welcome to the FastAPI Finance Backend!"}

# --- Optional: Startup event using decorator (alternative to lifespan) ---
# @app.on_event("startup")
# async def on_startup():
#     print("Application startup...")
#     await init_db()

# @app.on_event("shutdown")
# async def on_shutdown():
#     print("Application shutdown...")
