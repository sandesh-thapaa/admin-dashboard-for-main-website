from dotenv import load_dotenv
import os
from urllib.parse import urlparse
from pydantic_settings import BaseSettings

load_dotenv()

# Supabase (DB only)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# JWT
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", 120))

# Cloudinary
# CLOUDINARY_URL = os.getenv("CLOUDINARY_URL")

# Appwrite config
APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
APPWRITE_BUCKET_ID = os.getenv("APPWRITE_BUCKET_ID")

# Safety checks (fail fast)
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase env vars not loaded")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET not set")



# Appwrite for image storage
if not all([
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_BUCKET_ID,
]):
    raise RuntimeError("Appwrite env vars not loaded")