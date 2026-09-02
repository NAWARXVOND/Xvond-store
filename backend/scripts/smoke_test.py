import asyncio
import os

import httpx


async def require_ok(client: httpx.AsyncClient, path: str) -> None:
    response = await client.get(path)
    response.raise_for_status()
    print(f"OK  {path}  {response.status_code}")


async def run() -> None:
    api_root = os.getenv("STORE_API_ROOT", "http://localhost:8000").rstrip("/")
    async with httpx.AsyncClient(base_url=api_root, timeout=15.0) as client:
        await require_ok(client, "/health")
        await require_ok(client, "/ready")
        await require_ok(client, "/api/v1/catalog/categories")
        await require_ok(client, "/api/v1/catalog/products?limit=1")
    print("Smoke test passed")


if __name__ == "__main__":
    asyncio.run(run())
