import asyncio
import os

import httpx


async def require_ok(client: httpx.AsyncClient, path: str) -> httpx.Response:
    response = await client.get(path)
    response.raise_for_status()
    print(f"OK  {path}  {response.status_code}")
    return response


async def run() -> None:
    api_root = os.getenv("STORE_API_ROOT", "http://localhost:8000").rstrip("/")
    async with httpx.AsyncClient(base_url=api_root, timeout=15.0) as client:
        await require_ok(client, "/health")
        await require_ok(client, "/ready")
        categories = await require_ok(client, "/api/v1/catalog/categories")
        products = await require_ok(client, "/api/v1/catalog/products?limit=1")

        if not categories.json():
            raise RuntimeError("Catalog categories are empty")
        if not products.json():
            raise RuntimeError("No live product is available in the production catalog")

        non_oman_order = await client.post(
            "/api/v1/orders",
            json={
                "customer": {
                    "fullName": "Production Smoke Test",
                    "email": "smoke-test@example.com",
                    "phone": "+96890000000",
                    "countryCode": "AE",
                    "governorate": "Dubai",
                    "city": "Dubai",
                    "addressLine": "Validation-only request outside Oman",
                },
                "items": [{"product_slug": "validation-only", "quantity": 1}],
                "payment_method": "cash_on_delivery",
            },
        )
        if non_oman_order.status_code != 422:
            raise RuntimeError(
                "Oman-only checkout guard failed: non-Oman order was not rejected with 422"
            )
        print("OK  Oman-only checkout rejects non-Oman country")

    print("Smoke test passed")


if __name__ == "__main__":
    asyncio.run(run())
