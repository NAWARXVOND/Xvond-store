from pydantic import BaseModel, EmailStr, Field


class ProfileDetailsRead(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    full_name: str
    email: str | None = None
    phone: str | None = None
    email_verified: bool
    phone_verified: bool
    pending_email: str | None = None


class ProfileDetailsUpdate(BaseModel):
    first_name: str = Field(min_length=1, max_length=90)
    last_name: str = Field(min_length=1, max_length=90)


class ProfileEmailStart(BaseModel):
    email: EmailStr


class ProfilePhoneStart(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    locale: str = Field(default="ar", pattern="^(ar|en)$")


class ProfilePhoneConfirm(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    code: str = Field(min_length=4, max_length=10)
