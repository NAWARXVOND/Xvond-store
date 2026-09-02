import secrets
import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.core.security import (
    SESSION_COOKIE,
    create_session,
    decode_session,
    hash_password,
    verify_password,
)
from app.models.commerce import Address, Customer, Order
from app.schemas.auth import AddressWrite, LoginRequest, ProfileRead, RegisterRequest

router = APIRouter(tags=["authentication"])
Session = Annotated[AsyncSession, Depends(get_session)]


def set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=settings.session_hours * 3600,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )


async def current_customer(
    session: Session,
    session_cookie: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
) -> Customer:
    payload = decode_session(session_cookie)
    if payload.get("role") != "customer":
        raise HTTPException(status_code=401, detail="Customer authentication required")
    try:
        customer_id = uuid.UUID(str(payload["sub"]))
    except (ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid session") from None
    customer = await session.get(Customer, customer_id)
    if customer is None or not customer.is_active:
        raise HTTPException(status_code=401, detail="Customer not found")
    return customer


CurrentCustomer = Annotated[Customer, Depends(current_customer)]


def profile(customer: Customer) -> ProfileRead:
    return ProfileRead(id=str(customer.id), full_name=customer.full_name, email=customer.email)


@router.post("/auth/register", response_model=ProfileRead, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, response: Response, session: Session) -> ProfileRead:
    email = payload.email.lower()
    customer = await session.scalar(select(Customer).where(Customer.email == email))
    if customer is not None and customer.password_hash:
        raise HTTPException(status_code=409, detail="An account already exists")
    if customer is None:
        customer = Customer(email=email, full_name=payload.full_name)
        session.add(customer)
    customer.full_name = payload.full_name
    customer.password_hash = hash_password(payload.password)
    await session.commit()
    await session.refresh(customer)
    set_session_cookie(response, create_session(str(customer.id), "customer"))
    return profile(customer)


@router.post("/auth/login", response_model=ProfileRead)
async def login(payload: LoginRequest, response: Response, session: Session) -> ProfileRead:
    customer = await session.scalar(select(Customer).where(Customer.email == payload.email.lower()))
    if customer is None or not verify_password(payload.password, customer.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_session_cookie(response, create_session(str(customer.id), "customer"))
    return profile(customer)


@router.post("/auth/admin/login")
async def admin_login(payload: LoginRequest, response: Response) -> dict[str, str]:
    settings = get_settings()
    valid = secrets.compare_digest(payload.email.lower(), settings.admin_email.lower())
    valid &= secrets.compare_digest(payload.password, settings.admin_password)
    if not valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_session_cookie(response, create_session(settings.admin_email, "admin"))
    return {"role": "admin"}


@router.get("/auth/admin/me")
async def admin_me(
    session_cookie: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
) -> dict[str, str]:
    payload = decode_session(session_cookie)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Admin authentication required")
    return {"role": "admin", "email": str(payload["sub"])}


@router.post("/auth/logout", status_code=204)
async def logout(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")


@router.get("/account/me", response_model=ProfileRead)
async def me(customer: CurrentCustomer) -> ProfileRead:
    return profile(customer)


@router.get("/account/addresses")
async def addresses(customer: CurrentCustomer, session: Session) -> list[dict[str, str | None]]:
    result = await session.scalars(
        select(Address)
        .where(Address.customer_id == customer.id)
        .order_by(Address.created_at.desc())
    )
    return [
        {
            "id": str(item.id),
            "label": item.label,
            "governorate": item.governorate,
            "city": item.city,
            "address_line": item.address_line,
            "postal_code": item.postal_code,
        }
        for item in result
    ]


@router.post("/account/addresses", status_code=201)
async def add_address(
    payload: AddressWrite, customer: CurrentCustomer, session: Session
) -> dict[str, str]:
    address = Address(customer_id=customer.id, **payload.model_dump())
    session.add(address)
    await session.commit()
    return {"id": str(address.id)}


@router.delete("/account/addresses/{address_id}", status_code=204)
async def delete_address(
    address_id: uuid.UUID, customer: CurrentCustomer, session: Session
) -> None:
    address = await session.scalar(
        select(Address).where(Address.id == address_id, Address.customer_id == customer.id)
    )
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    await session.delete(address)
    await session.commit()


@router.get("/account/orders")
async def customer_orders(customer: CurrentCustomer, session: Session) -> list[dict[str, object]]:
    result = await session.scalars(
        select(Order).where(Order.customer_id == customer.id).order_by(Order.created_at.desc())
    )
    return [
        {
            "order_number": item.order_number,
            "status": item.status,
            "payment_status": item.payment_status,
            "currency": item.currency,
            "grand_total": str(item.grand_total),
            "created_at": item.created_at,
        }
        for item in result
    ]
