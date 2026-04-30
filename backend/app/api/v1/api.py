from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.profiles import router as profiles_router
from app.api.v1.endpoints.resume import router as resume_router
from app.api.v1.endpoints.analysis import router as analysis_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.cover_letters import router as cover_letters_router
from app.api.v1.endpoints.analytics import router as analytics_router


api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(profiles_router)
api_router.include_router(resume_router)
api_router.include_router(analysis_router)
api_router.include_router(jobs_router)
api_router.include_router(cover_letters_router)
api_router.include_router(analytics_router)