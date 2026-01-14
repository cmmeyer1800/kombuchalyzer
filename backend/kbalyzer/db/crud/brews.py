"""Brew CRUD operations."""
from collections.abc import Sequence
from typing import Annotated

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from kbalyzer.db.postgres import get_db
from kbalyzer.db.schemas.brews import Brew
from kbalyzer.logging import get_logger

logger = get_logger(__name__)


class BrewCRUD:
    """Brew CRUD operations."""

    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]) -> None:
        """Initialize class."""
        self.db = db

    async def get_brews(self, skip: int = 0, limit: int = 100) -> Sequence[Brew]:
        """Get all brews."""
        result = await self.db.execute(select(Brew).offset(skip).limit(limit))
        return result.scalars().all()

    async def brew_count(self) -> int:
        """Get brew count."""
        return (await self.db.execute(select(func.count()).select_from(Brew))).scalar_one()
