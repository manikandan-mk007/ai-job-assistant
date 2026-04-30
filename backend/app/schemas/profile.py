from pydantic import BaseModel


class ProfileCreateUpdate(BaseModel):
    target_role: str | None = None
    skills: str | None = None
    resume_text: str | None = None
    education: str | None = None
    projects: str | None = None
    summary: str | None = None


class ProfileOut(BaseModel):
    id: int
    user_id: int

    target_role: str | None = None
    skills: str | None = None
    resume_text: str | None = None
    education: str | None = None
    projects: str | None = None
    summary: str | None = None

    model_config = {"from_attributes": True}