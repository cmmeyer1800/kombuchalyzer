"""User CRUD operations."""
from collections.abc import Sequence
from typing import Annotated, Any
from uuid import UUID

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from jwt.exceptions import InvalidTokenError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from kbalyzer.auth import get_password_hash, oauth2_scheme, verify_password
from kbalyzer.db.postgres import get_db
from kbalyzer.db.schemas.user import UserSchema
from kbalyzer.logging import get_logger
from kbalyzer.models.user import UserCreate
from kbalyzer.settings import settings

logger = get_logger(__name__)

class UserCRUD:
    """User CRUD operations."""

    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]) -> None:
        """Initialize class."""
        self.db = db

    async def get_users(self, skip: int = 0, limit: int = 100) -> Sequence[UserSchema]:
        """Get all users."""
        result = await self.db.execute(select(UserSchema).offset(skip).limit(limit))
        return result.scalars().all()

    async def user_count(self) -> int:
        """Get user count."""
        return (await self.db.execute(select(func.count()).select_from(UserSchema))).scalar_one()

    async def get_user_by_email(self, email: str) -> UserSchema | None:
        """Get user by email."""
        result = await self.db.execute(select(UserSchema).where(UserSchema.email == email))
        return result.scalars().first()

    async def get_user_by_id(self, user_id: UUID) -> UserSchema | None:
        """Get user by id."""
        result = await self.db.execute(select(UserSchema).where(UserSchema.id == user_id))
        return result.scalars().first()

    async def create_user(self, user: UserCreate) -> UserSchema:
        """Create user.

        Args:
            user (UserCreate): User to create

        Returns:
            UserSchema: Created user

        Raises:
            ValueError: If user already exists

        """
        if await self.get_user_by_email(user.email):
            err = "User already exists with that email"
            logger.error("Tried to create user with existing email: %s", user.email)
            raise ValueError(err)

        args = user.model_dump()
        args["hashed_password"] = get_password_hash(args["password"])
        del args["password"]

        db_user = UserSchema(**args)
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def update_user(self, user: UserSchema, **kwargs: Any) -> UserSchema:
        """Update user."""
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def authenticate_user(self, email: str, password: str) -> UserSchema | None:
        """Authenticate user."""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None

        return user

    async def delete_user(self, user_id: UUID) -> UserSchema:
        """Delete user."""
        user = await self.get_user_by_id(user_id)
        if user is None:
            err = f"Tried to delete user that does not exist: {user_id}"
            logger.error(err)
            raise ValueError(err)

        await self.db.delete(user)
        await self.db.commit()

        return user


async def get_current_user(
    user_crud: Annotated[UserCRUD, Depends()],
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
    access_token: Annotated[str | None, Cookie()] = None,
) -> UserSchema:
    """Get the current user from the token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        if access_token is not None:
            logger.debug("Got access token from cookie")
            token = access_token

        if token is None:
            logger.debug("Got no token from cookie or header")
            raise credentials_exception
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception from None
    user = await user_crud.get_user_by_email(email=username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin_user(
    current_user: Annotated[UserSchema, Depends(get_current_user)],
) -> UserSchema:
    """Get current admin user from the token."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
