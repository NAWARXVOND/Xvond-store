from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import engine

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs" if settings.app_env != "production" else None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    if request.url.path.startswith(f"{settings.api_prefix}/admin") and request.method != "GET":
        content_type = request.headers.get("content-type", "")
        if request.method in {"POST", "PATCH"} and "application/json" not in content_type:
            return JSONResponse(
                status_code=415, content={"detail": "Content-Type must be application/json"}
            )
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "xvond-store-api"}


@app.get("/ready", tags=["system"])
async def ready() -> dict[str, str]:
    try:
        async with engine.connect() as connection:
            await connection.execute(text("select 1"))
    except (SQLAlchemyError, OSError):
        raise HTTPException(status_code=503, detail="Database unavailable") from None
    email_configured = bool(
        settings.smtp_host and settings.smtp_username and settings.smtp_password
    )
    return {
        "status": "ready",
        "database": "connected",
        "email": "configured" if email_configured else "not-configured",
    }


app.include_router(api_router, prefix=settings.api_prefix)
