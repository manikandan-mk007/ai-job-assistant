from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreateUpdate, ProfileOut


router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=ProfileOut | None)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Profile).filter(Profile.user_id == current_user.id).first()


@router.post("/me", response_model=ProfileOut)
def create_or_update_profile(
    payload: ProfileCreateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if profile:
        profile.target_role = payload.target_role
        profile.skills = payload.skills
        profile.resume_text = payload.resume_text
        profile.education = payload.education
        profile.projects = payload.projects
        profile.summary = payload.summary
    else:
        profile = Profile(
            user_id=current_user.id,
            target_role=payload.target_role,
            skills=payload.skills,
            resume_text=payload.resume_text,
            education=payload.education,
            projects=payload.projects,
            summary=payload.summary,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return profile