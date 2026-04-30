from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.saved_job import SavedJob
from app.models.user import User
from app.schemas.analytics import AnalyticsDashboardResponse
from app.utils.constants import (
    JOB_STATUS_APPLIED,
    JOB_STATUS_INTERVIEW,
    JOB_STATUS_REJECTED,
    JOB_STATUS_SAVED,
)


router = APIRouter(prefix="/analytics", tags=["Analytics"])


def split_csv(text: str | None) -> list[str]:
    if not text:
        return []
    return [item.strip() for item in text.split(",") if item.strip()]


@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    jobs = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()

    total_jobs = len(jobs)

    saved_jobs = sum(1 for job in jobs if job.status == JOB_STATUS_SAVED)
    applied_jobs = sum(1 for job in jobs if job.status == JOB_STATUS_APPLIED)
    interview_jobs = sum(1 for job in jobs if job.status == JOB_STATUS_INTERVIEW)
    rejected_jobs = sum(1 for job in jobs if job.status == JOB_STATUS_REJECTED)

    scores = [job.final_score for job in jobs if job.final_score is not None]

    average_score = round(sum(scores) / len(scores), 2) if scores else 0.0
    highest_score = round(max(scores), 2) if scores else 0.0
    lowest_score = round(min(scores), 2) if scores else 0.0

    strong_matches = sum(1 for score in scores if score >= 75)
    moderate_matches = sum(1 for score in scores if 55 <= score < 75)
    low_matches = sum(1 for score in scores if score < 55)

    missing_counter = Counter()
    priority_counter = Counter()
    source_counter = Counter()

    for job in jobs:
        missing_counter.update(split_csv(job.missing_skills))
        priority_counter.update(split_csv(job.priority_skills))

        if job.source:
            source_counter.update([job.source])

    return {
        "total_jobs": total_jobs,
        "saved_jobs": saved_jobs,
        "applied_jobs": applied_jobs,
        "interview_jobs": interview_jobs,
        "rejected_jobs": rejected_jobs,

        "average_score": average_score,
        "highest_score": highest_score,
        "lowest_score": lowest_score,

        "strong_matches": strong_matches,
        "moderate_matches": moderate_matches,
        "low_matches": low_matches,

        "top_missing_skills": [skill for skill, _ in missing_counter.most_common(10)],
        "top_priority_skills": [skill for skill, _ in priority_counter.most_common(10)],
        "top_sources": [source for source, _ in source_counter.most_common(10)],
    }