from pydantic import BaseModel


class AnalyticsDashboardResponse(BaseModel):
    total_jobs: int
    saved_jobs: int
    applied_jobs: int
    interview_jobs: int
    rejected_jobs: int

    average_score: float
    highest_score: float
    lowest_score: float

    strong_matches: int
    moderate_matches: int
    low_matches: int

    top_missing_skills: list[str]
    top_priority_skills: list[str]
    top_sources: list[str]