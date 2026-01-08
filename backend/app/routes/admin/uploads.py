import time
import hashlib
import hmac

from fastapi import APIRouter, Depends
from app.auth.deps import get_current_user
from app.config import settings

router = APIRouter(
    prefix="/admin/uploads",
    tags=["Uploads"],
)

def generate_cloudinary_signature(
    timestamp: int,
    folder: str | None = None,
) -> str:
    """
    Generates a Cloudinary upload signature.

    Cloudinary requires parameters to be:
    - alphabetically sorted
    - concatenated as key=value pairs
    - signed with API_SECRET
    """

    params = {"timestamp": timestamp}

    if folder:
        params["folder"] = folder

    param_string = "&".join(
        f"{key}={value}" for key, value in sorted(params.items())
    )

    # Cloudinary signature is a SHA1 hash of: param_string + API_SECRET
    # (Note: It is NOT an HMAC)
    if not settings.cloudinary_api_secret:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail="Cloudinary API Secret is not configured. Please check your .env file."
        )

    to_sign = f"{param_string}{settings.cloudinary_api_secret}"
    signature = hashlib.sha1(to_sign.encode()).hexdigest()

    return signature


@router.post("/signature")
def get_upload_signature(
    admin = Depends(get_current_user)
):
    """
    Returns a Cloudinary signed upload payload.
    Frontend uses this to upload images directly to Cloudinary.
    """

    timestamp = int(time.time())

    folder = "uploads"

    signature = generate_cloudinary_signature(
        timestamp=timestamp,
        folder=folder,
    )

    return {
        "cloud_name": settings.cloudinary_cloud_name,
        "api_key": settings.cloudinary_api_key,
        "timestamp": timestamp,
        "signature": signature,
        "folder": folder,
    }
