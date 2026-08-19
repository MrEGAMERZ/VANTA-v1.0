from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import shutil
import uuid

from routes.auth import get_current_user

router = APIRouter(prefix="/api/upload", tags=["upload"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp3", ".wav", ".pdf"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav", "application/pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("")
async def upload_file(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file extension")

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    file_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := file.file.read(8192):
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="File too large (max 5MB)")
            buffer.write(chunk)
        
    return {"url": f"/public/uploads/{unique_filename}"}
