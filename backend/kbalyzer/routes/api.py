"""General API collector for all routes under /api."""
from fastapi import APIRouter

from kbalyzer.routes.admin import router as admin_router
from kbalyzer.routes.auth import router as auth_router
from kbalyzer.routes.brews import router as brews_router
from kbalyzer.routes.docs import router as docs_router

router = APIRouter(
    prefix="/api",
)
router.include_router(admin_router)
router.include_router(auth_router)
router.include_router(docs_router)
router.include_router(brews_router)
