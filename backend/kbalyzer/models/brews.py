"""User interaction models."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BrewView(BaseModel):  # noqa: D101
    id: UUID
    name: str
    creation_date: datetime


class BrewAllResponse(BaseModel): # noqa: D101
    total: int
    brews: list[BrewView]
