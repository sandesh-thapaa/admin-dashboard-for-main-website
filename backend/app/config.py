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
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL")

# Safety checks (fail fast)
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase env vars not loaded")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET not set")

# Cloudinary url parsing to get cloud name, api key, and api secret
class Settings(BaseSettings):
    CLOUDINARY_URL: str | None = os.getenv("CLOUDINARY_URL")

    @property
    def cloudinary_cloud_name(self) -> str:
        if not self.CLOUDINARY_URL:
            return ""
        return urlparse(self.CLOUDINARY_URL).hostname or ""
    
    @property
    def cloudinary_api_key(self) -> str:
        if not self.CLOUDINARY_URL:
            return ""
        return urlparse(self.CLOUDINARY_URL).username or ""

    @property
    def cloudinary_api_secret(self) -> str:
        if not self.CLOUDINARY_URL:
            return ""
        return urlparse(self.CLOUDINARY_URL).password or ""

settings = Settings()

# Verify Cloudinary settings
if not settings.CLOUDINARY_URL:
    print("WARNING: CLOUDINARY_URL not set in environment")
elif not settings.cloudinary_api_secret:
    print("WARNING: CLOUDINARY_URL is set but missing API Secret (password component)")
