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

Frontend: `http://localhost:3000/ar`  
API docs: `http://localhost:8000/docs`

## Scope

The first foundation includes the premium store home, localized commerce routes, cart/wishlist client state, SEO primitives, catalog models, admin API authentication foundation, provider abstractions for future payments and shipping, tests, and CI. No payment gateway, shipping company, taxes, COD policy, return policy, or supplier decision is encoded yet.

## Production path

The canonical public URL is `https://xvond.com/store`. Set `NEXT_PUBLIC_BASE_PATH=/store` when deploying under that subpath. Run database migrations and provide production secrets through the deployment environment.

