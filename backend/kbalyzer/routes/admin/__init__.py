"""Admin API routes."""
from fastapi import APIRouter

from kbalyzer.routes.admin.user import router as user_router

router = APIRouter(
    prefix="/admin",
)
router.include_router(user_router)
