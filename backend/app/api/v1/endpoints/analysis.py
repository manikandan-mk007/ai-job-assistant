from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.analysis import AnalyzeJobRequest, AnalyzeJobResponse
from app.services.analysis_service import analyze_job_against_profile


router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.get("/health")
def analysis_health():
    return {"message": "Analysis route ready"}


@router.post("/analyze-job", response_model=AnalyzeJobResponse)
def analyze_job(
    payload: AnalyzeJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Profile not found. Please create your profile first.",
        )

    result = analyze_job_against_profile(
        target_role=profile.target_role,
        skills_text=profile.skills,
        projects=profile.projects,
        resume_text=profile.resume_text,
        job_title=payload.title,
        job_description=payload.description,
    )

    return result