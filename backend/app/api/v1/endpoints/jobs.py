from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.saved_job import SavedJob
from app.models.user import User
from app.schemas.job import SaveJobRequest, SavedJobOut, UpdateJobStatusRequest
from app.utils.constants import (
    JOB_STATUS_APPLIED,
    JOB_STATUS_INTERVIEW,
    JOB_STATUS_REJECTED,
    JOB_STATUS_SAVED,
)


router = APIRouter(prefix="/jobs", tags=["Jobs"])

ALLOWED_STATUSES = {
    JOB_STATUS_SAVED,
    JOB_STATUS_APPLIED,
    JOB_STATUS_INTERVIEW,
    JOB_STATUS_REJECTED,
}


def join_list(items: list[str] | None) -> str:
    if not items:
        return ""
    return ", ".join(str(item).strip() for item in items if str(item).strip())


@router.get("/health")
def jobs_health():
    return {"message": "Jobs route ready"}


@router.post("/save", response_model=SavedJobOut)
def save_job(
    payload: SaveJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = SavedJob(
        user_id=current_user.id,
        title=payload.title,
        company=payload.company,
        location=payload.location,
        url=payload.url,
        description=payload.description,

        extracted_skills=join_list(payload.extracted_skills),
        matched_skills=join_list(payload.matched_skills),
        missing_skills=join_list(payload.missing_skills),
        priority_skills=join_list(payload.priority_skills),
        suggested_keywords=join_list(payload.suggested_keywords),

        semantic_score=payload.semantic_score,
        skill_score=payload.skill_score,
        role_score=payload.role_score,
        project_score=payload.project_score,
        resume_score=payload.resume_score,
        final_score=payload.final_score,

        recommendation=payload.recommendation,
        match_summary=payload.match_summary,
        strengths=join_list(payload.strengths),
        weaknesses=join_list(payload.weaknesses),
        resume_improvements=join_list(payload.resume_improvements),
        learning_plan=join_list(payload.learning_plan),
        cover_letter_points=join_list(payload.cover_letter_points),

        source=payload.source,
        status=JOB_STATUS_SAVED,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get("", response_model=list[SavedJobOut])
def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )


@router.get("/{job_id}", response_model=SavedJobOut)
def get_job(
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

    return job


@router.patch("/{job_id}/status", response_model=SavedJobOut)
def update_job_status(
    job_id: int,
    payload: UpdateJobStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid job status")

    job = (
        db.query(SavedJob)
        .filter(SavedJob.id == job_id, SavedJob.user_id == current_user.id)
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = payload.status

    db.commit()
    db.refresh(job)

    return job