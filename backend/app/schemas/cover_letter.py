from datetime import datetime

from pydantic import BaseModel


class CoverLetterGenerateResponse(BaseModel):
    job_id: int
    generated_text: str


class CoverLetterOut(BaseModel):
    id: int
    job_id: int
    generated_text: str
    created_at: datetime

    model_config = {"from_attributes": True}