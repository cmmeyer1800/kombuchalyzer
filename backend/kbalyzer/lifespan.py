"""Kombuchalyzer FastAPI lifespan functions."""
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from kbalyzer.db.crud.user import UserCRUD
from kbalyzer.db.postgres import get_db
from kbalyzer.models.user import UserCreate
from kbalyzer.settings import settings


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    """Global lifespan function for FastAPI."""
    async for db in get_db():
        crud = UserCRUD(db)
        with suppress(ValueError):
            await crud.create_user(
                UserCreate(
                    email=settings.FIRST_SUPERUSER_EMAIL,
                    password=settings.FIRST_SUPERUSER_PASSWORD,
                    role="admin",
                ),
            )

    yield
