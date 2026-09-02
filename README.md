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
an order or expiring an abandoned online-payment order releases its allocated stock
and restores coupon usage exactly once.

Frontend: `http://localhost:3000/ar`  
API docs: `http://localhost:8000/docs`

## Admin control center

Open `/ar/admin` or `/en/admin` and sign in with `ADMIN_EMAIL` and
`ADMIN_PASSWORD` from the backend environment. Authentication uses a signed,
HttpOnly session cookie. The legacy admin API token remains available only as an
emergency automation credential. The admin covers products, categories, inventory,
orders, customers, coupons, discounts, and store settings. Product removal is a safe
archive operation so historical order data remains intact.

Shipping rates are managed at `/ar/admin/shipping` or `/en/admin/shipping`. Each active
delivery area can define its OMR charge, optional free-delivery threshold, and ETA
range. Checkout calculates shipping server-side after discounts and refuses to create
an order for an area that has no active delivery rate.

Launch readiness is available at `/ar/admin/readiness` or `/en/admin/readiness` and is
also linked from the authenticated admin screen. It checks the live catalog and stock,
active shipping areas, SMTP configuration, Tap configuration, and production HTTPS
state without exposing any secret values.

Customers can register or sign in at `/ar/account` or `/en/account`, save and remove
delivery addresses, and view their order history. Guest orders are linked when a
customer later claims the same email address.

Account completion includes single-use expiring email verification and password reset
tokens, cross-device wishlist sync, customer return requests, and order-event
notifications. Messages are committed to a durable database outbox with the related
commerce transaction and delivered by `python scripts/email_worker.py` through real
SMTP. Production refuses to boot with default secrets, local database credentials,
non-HTTPS frontend URLs, or missing SMTP credentials.

## Tap Payments

Tap is integrated through its hosted Charge flow and is disabled until real merchant
credentials are supplied. Set `TAP_ENABLED=true`, `TAP_SECRET_KEY`, `TAP_MERCHANT_ID`,
`TAP_WEBHOOK_URL`, and optionally `TAP_SOURCE_ID` (`src_all` by default). The secret key
is server-only. Checkout creates a pending order, then requests a Tap hosted payment
URL. Payment attempts are persisted and reusable if opening the hosted page fails.

Tap webhooks are authenticated with the documented HMAC-SHA256 `hashstring`. Before
an order is marked paid, the backend also requires the Tap charge ID, merchant order
reference, amount, and currency to match the stored payment attempt and order. A
`CAPTURED` webhook marks the payment paid and moves a pending order to confirmed.

When Tap is enabled, pending checkout inventory is held for
`PENDING_ORDER_HOLD_MINUTES` (30 minutes by default). A production worker releases
abandoned reservations after the hold expires, but skips an order while it still has
an active payment attempt. Manual/no-gateway orders do not receive this payment expiry.

## Production operations

For a production container deployment, copy `.env.production.example` to
`.env.production`, replace every placeholder, then run:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

The backend and frontend bind to localhost so the public HTTPS reverse proxy remains
the only internet-facing entry point. The production stack also runs the durable email
worker and unpaid-order expiry worker.

Before opening the store to customers, run the server-side preflight from the backend
container or backend working directory:

```bash
python scripts/production_preflight.py
```

It fails closed if the environment is not production, HTTPS is missing, the database
migration is behind Alembic head, catalog/stock is empty, shipping is unconfigured,
SMTP is incomplete, or Tap live configuration is not enabled.

After deployment, verify the public API path with:

```bash
STORE_API_ROOT=https://xvond.com/store-api python scripts/smoke_test.py
```

The smoke test checks health, database readiness, catalog categories, and product API
responses.

Create a PostgreSQL backup from the host with:

```bash
sh scripts/backup_database.sh
```

Backups are written to `./backups/` with restrictive permissions and are ignored by
Git. A host backup is not a substitute for off-server disaster-recovery storage; copy
production backups to the approved external storage location as part of operations.

## Scope

The store includes the premium localized storefront, cart/wishlist, customer accounts,
SEO, catalog and inventory management, configurable Oman delivery pricing, promotions,
admin operations, transactional email, Tap hosted-payment integration, abandoned-order
inventory recovery, and launch-readiness tooling. Courier-provider API integration,
tax rules, COD policy, return-policy text, real product data, supplier arrangements,
and live deployment credentials remain business or external-provider decisions and are
not invented in code.

## Production path

The canonical public URL is `https://xvond.com/store`. Set `NEXT_PUBLIC_BASE_PATH=/store`
when deploying under that subpath. Run database migrations and provide production
secrets through the deployment environment.
