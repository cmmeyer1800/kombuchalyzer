"""Entrypoint for FastAPI application."""
from fastapi import FastAPI

from kbalyzer.lifespan import lifespan
from kbalyzer.logging import get_logger
from kbalyzer.models.general import Health
from kbalyzer.routes.api import router as api_router
from kbalyzer.settings import settings

logger = get_logger(__name__)

app = FastAPI(
    title="Kombuchalyzer API",
    description="API for Kombuchalyzer",
    version="0.1.0",
    openapi_tags=[ # TODO: Move to separate file
        {
            "name": "general",
            "description": "General endpoints",
        },
        {
            "name": "auth",
            "description": "Authentication endpoints",
        },
        {
            "name": "user",
            "description": "Admin only user control endpoints",
        },
        {
            "name": "otp",
            "description": "Endpoints for handling OTP 2FA",
        },
    ],
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)
logger.info("Application created")

app.include_router(api_router)

if settings.ENV == "dev":
    from kbalyzer.routes.auth import nonapi_auth_router
    app.include_router(nonapi_auth_router)

@app.get("/health", tags=["general"])
def health() -> Health:
    """Check API health status."""
    return Health(message="OK")
