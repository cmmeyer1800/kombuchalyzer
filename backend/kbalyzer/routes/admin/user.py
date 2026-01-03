"""Admin only user API routes."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from kbalyzer.db.crud.user import UserCRUD, get_current_admin_user
from kbalyzer.models.user import UserAdminView, UserAllResponse, UserCreate

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.get("/")
async def get_user(
    user_crud: Annotated[UserCRUD, Depends()],
    _admin_user: Annotated[UserAdminView, Depends(get_current_admin_user)],
    user_email: str | None = None,
    user_id: UUID | None = None,
) -> UserAdminView:
    """Get all users."""
    if user_id is None and user_email is None:
        raise HTTPException(status_code=400, detail="Either id or email must be provided")

    if user_id is not None:
        user = await user_crud.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserAdminView(**user.__dict__)

    user = await user_crud.get_user_by_email(user_email) # type: ignore # noqa: PGH003
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserAdminView(**user.__dict__)


@router.get("/all")
async def get_all_users(
    user_crud: Annotated[UserCRUD, Depends()],
    _admin_user: Annotated[UserAdminView, Depends(get_current_admin_user)],
    skip: int = 0,
    limit: int = 100,
) -> UserAllResponse:
    """Get all users."""
    users = await user_crud.get_users(skip, limit)
    count = await user_crud.user_count()
    return UserAllResponse(
        users=[UserAdminView(**user.__dict__) for user in users],
        total=count,
    )


@router.post("/")
async def create_user(
    user_crud: Annotated[UserCRUD, Depends()],
    _admin_user: Annotated[UserAdminView, Depends(get_current_admin_user)],
    user_create: UserCreate,
) -> UserAdminView:
    """Get all users."""
    try:
        created = await user_crud.create_user(user_create)
    except ValueError:
        raise HTTPException(status_code=400, detail="User already exists") from None

    return UserAdminView(**created.__dict__)


@router.delete("/{user_id}")
async def delete_user(
    user_crud: Annotated[UserCRUD, Depends()],
    admin_user: Annotated[UserAdminView, Depends(get_current_admin_user)],
    user_id: UUID,
) -> UserAdminView:
    """Delete user."""
    if admin_user.id == user_id:
        raise HTTPException(status_code=400, detail="Admin users cannot delete themselves")

    try:
        deleted = await user_crud.delete_user(user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found") from None

    return UserAdminView(**deleted.__dict__)
