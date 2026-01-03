"""User interaction models."""
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel): # noqa: D101
    model_config = ConfigDict(from_attributes=True)
    email: str


class UserView(UserBase): # noqa: D101
    id: UUID
    totp_enabled: bool


class UserAdminView(UserView): # noqa: D101
    role: str
    is_active: bool


class UserCreate(UserBase): # noqa: D101
    password: str
    role: str = "user"
    is_active: bool = True


class UserAllResponse(BaseModel): # noqa: D101
    total: int
    users: list[UserAdminView]
