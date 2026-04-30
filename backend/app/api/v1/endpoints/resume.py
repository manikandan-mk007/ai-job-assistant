from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.resume import ResumeUploadResponse
from app.services.resume_parser import parse_resume_file


router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        file_bytes = await file.read()
        extracted_text = parse_resume_file(file.filename.lower(), file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse resume")

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if profile:
        profile.resume_text = extracted_text
    else:
        profile = Profile(
            user_id=current_user.id,
            resume_text=extracted_text,
        )
        db.add(profile)

    db.commit()

    return {
        "message": "Resume uploaded and parsed successfully",
        "extracted_text": extracted_text,
    }