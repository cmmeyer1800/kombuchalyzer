"""Pydantic models for Kombuchalyzer auth endpoints."""
from pydantic import BaseModel


class Token(BaseModel): # noqa: D101
    access_token: str
    token_type: str


class LogoutDetails(BaseModel): # noqa: D101
    message: str


class OTPSubmission(BaseModel): # noqa: D101
    code: str


class OTPFlowSubmission(OTPSubmission): # noqa: D101
    access_token: str
