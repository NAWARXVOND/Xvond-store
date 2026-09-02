from fastapi import APIRouter

from app.api import admin, catalog

api_router = APIRouter()
api_router.include_router(catalog.router)
api_router.include_router(admin.router)
