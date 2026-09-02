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

Frontend: `http://localhost:3000/ar`  
API docs: `http://localhost:8000/docs`

## Admin control center

Open `/ar/admin` or `/en/admin` and sign in with the value configured as
`ADMIN_API_TOKEN` in the backend environment. The token stays in page memory and is
not persisted in browser storage. The first admin milestone covers products,
categories, inventory, orders, customers, coupons, discounts, and store settings.
Product removal is a safe archive operation so historical order data remains intact.

## Scope

The first foundation includes the premium store home, localized commerce routes, cart/wishlist client state, SEO primitives, catalog models, admin API authentication foundation, provider abstractions for future payments and shipping, tests, and CI. No payment gateway, shipping company, taxes, COD policy, return policy, or supplier decision is encoded yet.

## Production path

The canonical public URL is `https://xvond.com/store`. Set `NEXT_PUBLIC_BASE_PATH=/store` when deploying under that subpath. Run database migrations and provide production secrets through the deployment environment.
