"""Brew API endpoints."""
from typing import Annotated

from fastapi import APIRouter, Depends

from kbalyzer.db.crud.brews import BrewCRUD
from kbalyzer.db.crud.user import get_current_admin_user
from kbalyzer.models.brews import BrewAllResponse
from kbalyzer.models.user import UserAdminView

router = APIRouter(
    prefix="/brews",
)

@router.get("/", tags=["brews"])
async def get_brews(
    brew_crud: Annotated[BrewCRUD, Depends()],
    _admin_user: Annotated[UserAdminView, Depends(get_current_admin_user)],
    skip: int = 0,
    limit: int = 100,
) -> BrewAllResponse:
    """Get list of brews."""
    return BrewAllResponse(
        total = await brew_crud.brew_count(),
        brews = list(await brew_crud.get_brews(skip=skip, limit=limit)),
    )
