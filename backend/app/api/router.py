from fastapi import APIRouter

from app.api import accounts, admin, catalog, orders, payments

api_router = APIRouter()
api_router.include_router(accounts.router)
api_router.include_router(catalog.router)
api_router.include_router(admin.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
