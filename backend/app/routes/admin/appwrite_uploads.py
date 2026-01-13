from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.auth.deps import get_current_user
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.id import ID
from appwrite.input_file import InputFile
from app.config import (
    APPWRITE_API_KEY,
    APPWRITE_BUCKET_ID,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID
)

router = APIRouter(
    prefix="/admin/uploads",
    tags=["Uploads"],
)




def get_storage() -> Storage:
    client = Client()
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    return Storage(client)

MAX_IMAGE_SIZE = 1_000_000  # 1 MB

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image type")
    
    storage = get_storage()

    try:
        # read file bytes
        file_bytes = await file.read()

        # Validate file size
        if len(file_bytes) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Image too large (max 1MB allowed)"
            )
        #  wrap for appwrite
        input_file = InputFile.from_bytes(
            file_bytes,
            filename=file.filename,
            mime_type = file.content_type,
        )
        # upload
        result = storage.create_file(
            bucket_id=APPWRITE_BUCKET_ID,
            file_id=ID.unique(),
            file=input_file,
        )
    except HTTPException:
        raise
    except Exception as e:
        print("APPWRITE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "image_url": (
        f"{APPWRITE_ENDPOINT}/storage/buckets/"
        f"{APPWRITE_BUCKET_ID}/files/{result['$id']}/view"
        f"?project={APPWRITE_PROJECT_ID}"
    )
    }
