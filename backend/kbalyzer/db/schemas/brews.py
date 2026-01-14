"""User database schema."""
from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID as PgUUID  # noqa: N811
from sqlalchemy.orm import Mapped, mapped_column

from kbalyzer.db.postgres import Base


class Brew(Base):
    """User database schema."""

    __tablename__ = "brew"
    id: Mapped[UUID] = mapped_column(
        PgUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    name: Mapped[str] = mapped_column(String, unique=True)
    creation_date: Mapped[datetime] = mapped_column(default = lambda: datetime.now(UTC))

