# Xvond Store

Premium bilingual commerce platform for **Xvond Store**, intentionally separate from `Xvond-core`.

## Store architecture

The public storefront has one fixed entry gateway and two first-class stores:

- **Xvond Lifestyle Store** — Women, Kids, Gifts, Automotive.
- **Xvond Smart Store** — Smart Tech and Xvond Box.

They share one account, wishlist, cart, checkout, order system and admin platform. The public gateway at `/{locale}` is the only top-level store selector. Legacy mixed-store browsing routes are not used as storefront destinations.

## Current launch market

The first production launch is intentionally restricted to the **Sultanate of Oman**:

- checkout country is fixed to Oman (`OM`) and non-Oman country values are rejected server-side;
- all 11 Oman governorates are seeded as supported delivery areas and checkout uses a bilingual governorate selector;
- delivery is free (`0.000 OMR`) across all active Oman governorates for the current launch policy;
- all storefront prices and order totals are in Omani Rial (`OMR`);
- Cash on Delivery is a valid production payment method; Tap can be enabled as an additional online payment method when live merchant credentials are ready;
- the primary commerce database must be hosted in Oman for production. `DATABASE_RESIDENCY_COUNTRY=OM` is a production guard, but operations must also verify that the actual production host/database infrastructure is physically located in Oman before publishing the privacy statement.

International country detection, localized currencies and country-specific delivery rules are a later expansion phase and must not be enabled during the Oman-only launch.

## Technical architecture

- `frontend/` — Next.js, TypeScript, Arabic/English, RTL/LTR, storefront and admin.
- `backend/` — FastAPI, SQLAlchemy, PostgreSQL commerce API.
- `.github/workflows/ci.yml` — frontend and backend checks.

## Local development

1. Copy `.env.example` values into local environment files. Never commit real secrets.
2. Start only the Store PostgreSQL service when needed; keep Store infrastructure isolated from `Xvond-core`.
3. Frontend: `cd frontend && npm install && npm run dev`.
4. Backend: `cd backend && python -m venv .venv && pip install -e '.[dev]' && uvicorn app.main:app --reload`.

Initialize the Store database once from `backend/`:

```bash
alembic upgrade head
python scripts/seed_catalog.py
```

The migrations seed the 11 Oman governorates as free-delivery areas. The catalog seed command is idempotent and prepares the approved Store categories. Products added through admin become visible through their owning Lifestyle or Smart collection, search, product, wishlist and sitemap routes through the catalog API.

Checkout quotes are calculated by the backend from current prices and inventory. The highest eligible automatic discount or coupon is applied (promotions do not stack), and stock is allocated atomically when a pending order is created. Cancelling an order or expiring an abandoned online-payment order releases its allocated stock and restores coupon usage exactly once.

Frontend: `http://localhost:3000/ar`  
API docs: `http://localhost:8000/docs`

## Admin control center

Open `/ar/admin` or `/en/admin` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the backend environment. Authentication uses a signed, HttpOnly session cookie. The legacy admin API token remains available only as an emergency automation credential. The admin covers products, categories, inventory, orders, customers, coupons, discounts, and store settings. Product removal is a safe archive operation so historical order data remains intact.

Delivery areas are visible and manageable at `/ar/admin/shipping` or `/en/admin/shipping`. For the current Oman launch, all 11 governorates must remain active and their delivery amount must remain `0.000 OMR`. The launch-readiness checks fail if a governorate is missing/inactive or if an active area has a non-zero delivery fee.

Launch readiness is available at `/ar/admin/readiness` or `/en/admin/readiness` and is linked from the authenticated admin screen. It checks the live catalog and stock, all 11 free Oman delivery areas, Oman database-residency setting, SMTP configuration, a valid production payment path (COD is sufficient; Tap is optional), and production HTTPS state without exposing secret values.

Customers can register or sign in at `/ar/account` or `/en/account`, save and remove delivery addresses, and view their order history. Guest orders are linked when a customer later claims the same email address.

Account completion includes single-use expiring email verification and password reset tokens, cross-device wishlist sync, customer return requests, and order-event notifications. Messages are committed to a durable database outbox with the related commerce transaction and delivered by `python scripts/email_worker.py` through real SMTP. Production refuses to boot with default secrets, local database credentials, non-HTTPS frontend URLs, non-Oman database residency, or missing SMTP credentials.

## Tap Payments

Tap is integrated through its hosted Charge flow and is disabled until real merchant credentials are supplied. Set `TAP_ENABLED=true`, `TAP_SECRET_KEY`, `TAP_MERCHANT_ID`, `TAP_WEBHOOK_URL`, and optionally `TAP_SOURCE_ID` (`src_all` by default) when the live merchant account is ready. The secret key is server-only. Until then, the store can launch using Cash on Delivery.

When Tap is enabled, checkout creates a pending order, then requests a Tap hosted payment URL. Payment attempts are persisted and reusable if opening the hosted page fails. Tap webhooks are authenticated with the documented HMAC-SHA256 `hashstring`. Before an order is marked paid, the backend also requires the Tap charge ID, merchant order reference, amount, and currency to match the stored payment attempt and order. A `CAPTURED` webhook marks the payment paid and moves a pending order to confirmed.

When Tap is enabled, pending checkout inventory is held for `PENDING_ORDER_HOLD_MINUTES` (30 minutes by default). A production worker releases abandoned reservations after the hold expires, but skips an order while it still has an active payment attempt. COD orders do not receive this payment expiry.

## Production operations

For a production container deployment, copy `.env.production.example` to `.env.production`, replace every placeholder, and verify that the production VPS/database host is physically located in Oman before starting the Store stack. Keep Store containers, ports, networks, volumes and credentials isolated from `Xvond-core`.

Before opening the store to customers, run the server-side preflight from the Store backend container or backend working directory:

```bash
python scripts/production_preflight.py
```

It fails closed if the environment is not production, HTTPS is missing, the database migration is behind Alembic head, catalog/stock is empty, fewer than 11 Oman governorates are active, any active delivery area has a non-zero fee, `DATABASE_RESIDENCY_COUNTRY` is not `OM`, or SMTP is incomplete. Tap is not a launch requirement because Cash on Delivery is a production payment path.

After deployment, verify the public API path with:

```bash
STORE_API_ROOT=https://xvond.com/store-api python scripts/smoke_test.py
```

The smoke test checks health, database readiness, catalog categories, and product API responses.

Create a PostgreSQL backup from the host with:

```bash
sh scripts/backup_database.sh
```

Backups are written to `./backups/` with restrictive permissions and are ignored by Git. A host backup is not a substitute for off-server disaster-recovery storage; copy production backups to approved external storage as part of operations.

## Scope and remaining launch inputs

The codebase includes the localized two-store storefront, cart/wishlist, customer accounts, SEO, catalog and inventory management, Oman-only checkout enforcement, all 11 Oman governorates, free delivery, OMR pricing, COD, optional Tap hosted payments, promotions, admin operations, transactional email, abandoned-online-order inventory recovery, legal policy pages, and launch-readiness tooling.

The following are real business or infrastructure inputs and must not be invented in code: actual sellable product data and stock, an Oman-hosted production VPS/database, production secrets, SMTP credentials, final legal-operator details, suppliers, product media/storage, reverse-proxy/DNS/HTTPS deployment, operational delivery/courier process, tax/VAT treatment, and off-server backups. Tap live credentials/merchant approval are needed only if online Tap payment is enabled at launch.

## Production path

The canonical public URL is `https://xvond.com/store`. Set `NEXT_PUBLIC_BASE_PATH=/store` when deploying under that subpath. Run Store database migrations and provide production secrets through the Store deployment environment.
