"""User database schema."""
from typing import Literal, get_args
from uuid import UUID, uuid4

from sqlalchemy import Enum, String
from sqlalchemy.dialects.postgresql import UUID as PgUUID  # noqa: N811
from sqlalchemy.orm import Mapped, mapped_column

from kbalyzer.db.postgres import Base

UserRole = Literal["user", "admin"]

class UserSchema(Base):
    """User database schema."""

    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(
        PgUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    email: Mapped[str] = mapped_column(String, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(default=True)
    role: Mapped[UserRole] = mapped_column(Enum(
        *get_args(UserRole),
        name="user_role",
        create_constraint=True,
        validate_strings=True,
    ), default="user")
    needs_password_change: Mapped[bool] = mapped_column(default=False)
    totp_enabled: Mapped[bool] = mapped_column(default=False)
    totp_secret: Mapped[str] = mapped_column(String(32), nullable=True)
