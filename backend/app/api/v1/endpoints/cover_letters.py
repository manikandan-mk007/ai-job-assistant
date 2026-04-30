from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.cover_letter import CoverLetter
from app.models.profile import Profile
from app.models.saved_job import SavedJob
from app.models.user import User
from app.schemas.cover_letter import CoverLetterGenerateResponse, CoverLetterOut
from app.services.cover_letter_service import generate_cover_letter


router = APIRouter(prefix="/cover-letters", tags=["Cover Letters"])


def split_csv(text: str | None) -> list[str]:
    if not text:
        return []
    return [item.strip() for item in text.split(",") if item.strip()]


@router.post("/generate/{job_id}", response_model=CoverLetterGenerateResponse)
def generate_for_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = (
        db.query(SavedJob)
        .filter(SavedJob.id == job_id, SavedJob.user_id == current_user.id)
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    generated_text = generate_cover_letter(
        user_name=current_user.name,
        target_role=profile.target_role if profile else None,
        skills=profile.skills if profile else None,
        projects=profile.projects if profile else None,
        job_title=job.title,
        company=job.company,
        matched_skills=split_csv(job.matched_skills),
        missing_skills=split_csv(job.missing_skills),
    )

    existing = db.query(CoverLetter).filter(CoverLetter.job_id == job.id).first()

    if existing:
        existing.generated_text = generated_text
        db.commit()
        db.refresh(existing)

        return {
            "job_id": job.id,
            "generated_text": existing.generated_text,
        }

    cover_letter = CoverLetter(
        job_id=job.id,
        generated_text=generated_text,
    )

    db.add(cover_letter)
    db.commit()
    db.refresh(cover_letter)

    return {
        "job_id": job.id,
        "generated_text": cover_letter.generated_text,
    }


@router.get("/{job_id}", response_model=CoverLetterOut)
def get_cover_letter(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = (
        db.query(SavedJob)
        .filter(SavedJob.id == job_id, SavedJob.user_id == current_user.id)
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cover_letter = db.query(CoverLetter).filter(CoverLetter.job_id == job.id).first()

    if not cover_letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")

    return cover_letter