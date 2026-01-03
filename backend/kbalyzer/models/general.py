"""Pydantic models for Kombuchalyzer general endpoints."""
from typing import Literal

from pydantic import BaseModel


class Health(BaseModel): # noqa: D101
    message: Literal["OK"]
