"""Kombuchalyzer custom docs endpoints."""
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse

from kbalyzer.db.crud.user import get_current_admin_user
from kbalyzer.models.user import UserAdminView

router = APIRouter()

@router.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html(
    _admin_user: Annotated[UserAdminView, Depends(get_current_admin_user)],
) -> HTMLResponse:
    """Get custom swagger UI HTML."""
    return get_swagger_ui_html(openapi_url="/api/openapi.json", title="Kombuchalyzer")


@router.get("/openapi.json", include_in_schema=False)
async def get_openapi_json(
    request: Request,
    _admin_user: Annotated[UserAdminView, Depends(get_current_admin_user)],
) -> HTMLResponse:
    """Get OpenAPI JSON."""
    return request.app.openapi()
