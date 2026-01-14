"""TOTP API endpoints and utilities."""
import io
from typing import Annotated

import pyotp
import qrcode
from fastapi import APIRouter, Depends, Response

from kbalyzer.db.crud.user import UserCRUD, get_current_user
from kbalyzer.db.schemas.user import UserSchema
from kbalyzer.models.auth import OTPSubmission

router = APIRouter(
    prefix="/otp",
    tags=["otp"],
)


@router.get("/generate")
async def generate_qr_code(
    user_crud: Annotated[UserCRUD, Depends(UserCRUD)],
    user: Annotated[UserSchema, Depends(get_current_user)],
) -> Response:
    """Generate QR code for TOTP."""
    if user.totp_enabled:
        return Response(status_code=400, content="TOTP is already enabled for this user.")

    totp_secret = pyotp.random_base32() if not user.totp_secret else user.totp_secret
    user = await user_crud.update_user(user, totp_secret=totp_secret)
    totp = pyotp.TOTP(totp_secret)
    qr_code = qrcode.make(
        totp.provisioning_uri(name=user.email, issuer_name="Kombuchalyzer"),
    )
    img_byte_arr = io.BytesIO()
    qr_code.save(stream=img_byte_arr, format="PNG")
    img_byte_arr = img_byte_arr.getvalue()
    return Response(content=img_byte_arr, media_type="image/png")


@router.post("/enable")
async def enable_totp(
    otp: OTPSubmission,
    user_crud: Annotated[UserCRUD, Depends(UserCRUD)],
    user: Annotated[UserSchema, Depends(get_current_user)],
) -> Response:
    """Validate QR code for TOTP."""
    totp = pyotp.TOTP(user.totp_secret).now()
    if totp != otp.code:
        return Response(status_code=401)

    await user_crud.update_user(user, totp_enabled=True)
    return Response(status_code=200)


@router.post("/disable")
async def disable_totp(
    otp: OTPSubmission,
    user_crud: Annotated[UserCRUD, Depends(UserCRUD)],
    user: Annotated[UserSchema, Depends(get_current_user)],
) -> Response:
    """Validate QR code for TOTP."""
    totp = pyotp.TOTP(user.totp_secret).now()
    if totp != otp.code:
        return Response(status_code=401)

    await user_crud.update_user(user, totp_enabled=False)
    return Response(status_code=200)
