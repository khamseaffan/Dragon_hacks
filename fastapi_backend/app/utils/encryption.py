# app/utils/encryption.py
# Utilities for encrypting and decrypting sensitive data like Plaid access tokens.

from cryptography.fernet import Fernet
import base64
import os
from app.core.config import settings

# We should store this key securely, ideally in a key management system
# For development, we'll use an environment variable
ENCRYPTION_KEY = settings.ENCRYPTION_KEY.encode() if hasattr(settings, 'ENCRYPTION_KEY') else None

if not ENCRYPTION_KEY:
    # Generate a key if not provided (this should be stored and reused)
    ENCRYPTION_KEY = base64.urlsafe_b64encode(os.urandom(32))
    print("WARNING: No encryption key found in settings. Generated a temporary one.")
    print(f"Set ENCRYPTION_KEY={ENCRYPTION_KEY.decode()} in your environment for persistence.")

# Initialize Fernet with the key
fernet = Fernet(ENCRYPTION_KEY)

def encrypt_token(token: str) -> str:
    """
    Encrypt a token (e.g., Plaid access token) for secure storage.
    
    Args:
        token: The plaintext token to encrypt
        
    Returns:
        The encrypted token as a string
    """
    if not token:
        return ""
    
    encrypted_token = fernet.encrypt(token.encode())
    return encrypted_token.decode()

def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypt an encrypted token (e.g., Plaid access token).
    
    Args:
        encrypted_token: The encrypted token string
        
    Returns:
        The decrypted plaintext token
    """
    if not encrypted_token:
        return ""
    
    decrypted_token = fernet.decrypt(encrypted_token.encode())
    return decrypted_token.decode()