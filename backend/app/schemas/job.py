from datetime import datetime

from pydantic import BaseModel, Field


class SaveJobRequest(BaseModel):
    title: str
    company: str
    location: str | None = None
    url: str
    description: str

    extracted_skills: list[str] = []
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    priority_skills: list[str] = []
    suggested_keywords: list[str] = []

    semantic_score: float = 0.0
    skill_score: float = 0.0
    role_score: float = 0.0
    project_score: float = 0.0
    resume_score: float = 0.0
    final_score: float = 0.0

    recommendation: str | None = None
    match_summary: str | None = None
    strengths: list[str] = []
    weaknesses: list[str] = []
    resume_improvements: list[str] = []
    learning_plan: list[str] = []
    cover_letter_points: list[str] = []

    source: str | None = None


class UpdateJobStatusRequest(BaseModel):
    status: str = Field(..., min_length=2)


class SavedJobOut(BaseModel):
    id: int

    title: str
    company: str
    location: str | None = None
    url: str
    description: str

    extracted_skills: str | None = None
    matched_skills: str | None = None
    missing_skills: str | None = None
    priority_skills: str | None = None
    suggested_keywords: str | None = None

    semantic_score: float
    skill_score: float
    role_score: float
    project_score: float
    resume_score: float
    final_score: float

    recommendation: str | None = None
    match_summary: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    resume_improvements: str | None = None
    learning_plan: str | None = None
    cover_letter_points: str | None = None

    status: str
    source: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}