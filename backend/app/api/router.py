from fastapi import APIRouter

from app.api import (
    accounts,
    admin,
    catalog,
    courier,
    external_auth,
    orders,
    payments,
    phone_auth,
    readiness_admin,
    shipping_admin,
)

api_router = APIRouter()
api_router.include_router(accounts.router)
api_router.include_router(external_auth.router)
api_router.include_router(phone_auth.router)
api_router.include_router(catalog.router)
api_router.include_router(admin.router)
api_router.include_router(shipping_admin.router)
api_router.include_router(readiness_admin.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(courier.router)
