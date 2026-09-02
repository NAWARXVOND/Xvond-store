from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Xvond Store API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://xvond_store:xvond_store@localhost:5432/xvond_store"
    admin_api_token: str = Field(default="development-only-token-change-me", min_length=24)
    admin_email: str = "admin@xvond.com"
    admin_password: str = Field(default="development-admin-password", min_length=12)
    session_secret: str = Field(default="development-session-secret-change-me", min_length=32)
    session_hours: int = Field(default=12, ge=1, le=168)
    frontend_url: str = "http://localhost:3000"
    email_from: str = "Xvond Store <support@xvond.com>"
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def secure_cookies(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
