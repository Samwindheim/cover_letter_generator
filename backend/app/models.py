from pydantic import BaseModel

class GenerateRequest(BaseModel):
    resume_path: str # For now, we'll pass a path. Later, this will change for file upload.
    job_description: str

class GenerateResponse(BaseModel):
    cover_letter: str
    message: str = "Cover letter generated successfully" 