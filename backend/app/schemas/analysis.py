from pydantic import BaseModel, Field


class AnalyzeJobRequest(BaseModel):
    title: str = Field(..., min_length=2)
    company: str = Field(default="Unknown Company")
    location: str | None = None
    url: str = Field(default="")
    description: str = Field(..., min_length=20)


class AnalyzeJobResponse(BaseModel):
    extracted_skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    priority_skills: list[str]
    suggested_keywords: list[str]

    semantic_score: float
    skill_score: float
    role_score: float
    project_score: float
    resume_score: float
    final_score: float

    recommendation: str
    match_summary: str
    strengths: list[str]
    weaknesses: list[str]
    resume_improvements: list[str]
    learning_plan: list[str]
    cover_letter_points: list[str]