"""Auth API endpoints."""
from datetime import timedelta
from typing import Annotated

import jwt
import pyotp
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from kbalyzer.auth import create_access_token
from kbalyzer.db.crud.user import UserCRUD, get_current_user
from kbalyzer.db.schemas.user import UserSchema
from kbalyzer.models.auth import LogoutDetails, OTPFlowSubmission, Token
from kbalyzer.models.user import UserAdminView
from kbalyzer.routes.otp import router as otp_router
from kbalyzer.settings import settings

router = APIRouter(
    prefix="/auth",
)

router.include_router(otp_router)

@router.post("/token", tags=["auth"])
async def login_for_access_token(
    response: Response,
    user_crud: Annotated[UserCRUD, Depends()],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """Login user and return access token."""
    user = await user_crud.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.totp_enabled:
        totp_verification_token = create_access_token(
            subject=user.email, expires_delta=timedelta(minutes=5),
        )
        return Token(
            access_token=totp_verification_token, token_type="totp", # noqa: S106
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires,
    )
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return Token(access_token=access_token, token_type="bearer") # noqa: S106


@router.post("/token-2fa", tags=["auth"])
async def login_for_access_token_with_2fa(
    response: Response,
    token: OTPFlowSubmission,
    user_crud: Annotated[UserCRUD, Depends()],
) -> Token:
    """Post login user with 2FA and return access token."""
    payload = jwt.decode(token.access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    email = payload.get("sub")
    user = await user_crud.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    totp = pyotp.TOTP(user.totp_secret).verify(token.code)
    if not totp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 2FA code",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires,
    )
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return Token(access_token=access_token, token_type="bearer") # noqa: S106


@router.get("/me", tags=["auth"])
async def get_current_user_info(
    current_user: Annotated[UserSchema, Depends(get_current_user)],
) -> UserAdminView:
    """Get current authenticated user information."""
    return UserAdminView(**current_user.__dict__)


@router.post("/logout", tags=["auth"])
async def logout(response: Response) -> LogoutDetails:
    """Logout user."""
    response.delete_cookie(key="access_token")
    return LogoutDetails(message="Successfully logged out")


if settings.ENV == "dev":
    nonapi_auth_router = APIRouter(
        tags=["auth"],
    )

    # This endpoint allows us to login without a UI which is useful for testing
    @nonapi_auth_router.get("/login", tags=["auth"])
    async def login() -> HTMLResponse:
        """Get login page."""
        return HTMLResponse(content="""<form method="post" action="/api/auth/token">
    <h1>Login</h1>
    <input name="username" type="text" placeholder="username">
    <input name="password" type="password" placeholder="password">
    <button type="submit">Login</button>
</form>
    """)
