from pydantic import BaseModel


class ResumeUploadResponse(BaseModel):
    message: str
    extracted_text: str