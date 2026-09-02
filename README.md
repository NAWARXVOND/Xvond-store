# Xvond Store

Premium bilingual commerce foundation for **Xvond Store**. The repository is intentionally separate from `Xvond-core`.

## Architecture

- `frontend/` — Next.js, TypeScript, Arabic/English, RTL/LTR, storefront and admin shell.
- `backend/` — FastAPI, SQLAlchemy, PostgreSQL-ready REST API.
- `.github/workflows/ci.yml` — frontend and backend checks.

## Local development

1. Copy `.env.example` values into local environment files. Never commit real secrets.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Frontend: `cd frontend && npm install && npm run dev`.
4. Backend: `cd backend && python -m venv .venv && pip install -e '.[dev]' && uvicorn app.main:app --reload`.

Initialize the database once from `backend/`:

```bash
alembic upgrade head
python scripts/seed_catalog.py
```

The seed command is idempotent and only prepares the five approved store categories.
Products added through admin become visible immediately on home, category, search,
product, wishlist, and sitemap routes through the catalog API.

Checkout quotes are calculated by the backend from current prices and inventory.
The highest eligible automatic discount or coupon is applied (promotions do not
stack), and stock is allocated atomically when a pending order is created. Cancelling
an order from admin releases its allocated stock once.

Frontend: `http://localhost:3000/ar`  
API docs: `http://localhost:8000/docs`

## Admin control center

Open `/ar/admin` or `/en/admin` and sign in with `ADMIN_EMAIL` and
`ADMIN_PASSWORD` from the backend environment. Authentication uses a signed,
HttpOnly session cookie. The legacy admin API token remains available only as an
emergency automation credential. The admin covers products,
categories, inventory, orders, customers, coupons, discounts, and store settings.
Product removal is a safe archive operation so historical order data remains intact.

Customers can register or sign in at `/ar/account` or `/en/account`, save and
remove delivery addresses, and view their order history. Guest orders are linked
when a customer later claims the same email address.

## Scope

The first foundation includes the premium store home, localized commerce routes, cart/wishlist client state, SEO primitives, catalog models, admin API authentication foundation, provider abstractions for future payments and shipping, tests, and CI. No payment gateway, shipping company, taxes, COD policy, return policy, or supplier decision is encoded yet.

## Production path

The canonical public URL is `https://xvond.com/store`. Set `NEXT_PUBLIC_BASE_PATH=/store` when deploying under that subpath. Run database migrations and provide production secrets through the deployment environment.
