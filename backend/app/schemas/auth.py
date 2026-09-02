from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=180)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProfileRead(BaseModel):
    id: str
    full_name: str
    email: str


class AddressWrite(BaseModel):
    label: str = Field(default="home", min_length=1, max_length=80)
    governorate: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=120)
    address_line: str = Field(min_length=5, max_length=300)
    postal_code: str | None = Field(default=None, max_length=20)
