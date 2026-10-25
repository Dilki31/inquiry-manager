# Customer Inquiry Manager

A small full-stack app for recording customer inquiries and moving them through a simple lifecycle.
Staff sign in, record an inquiry, find it later, and change its status (New, In Progress, Resolved).

**Stack:** Next.js (React) | Node.js + Express | PostgreSQL

## Prerequisites

- Node.js 20 or newer
- PostgreSQL 15 or newer

## Setup

### 1. Database

Create an empty database:

```bash
psql -U postgres -c "CREATE DATABASE inquiry_db;"
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
```

Edit `backend/.env`:

- Set the password in `DATABASE_URL`.
- Set `JWT_SECRET` to a long random value. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Create the tables and demo users, then start the API:

```bash
psql -U postgres -d inquiry_db -f db/schema.sql
npm run seed
npm run dev
```

The API runs on http://localhost:4000.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

NEXT_PUBLIC_API_URL=http://localhost:4000/api


Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Test accounts

Created by `npm run seed` (local development only):

| Role  | Email                    | Password     |
|-------|--------------------------|--------------|
| Staff | staff1@coffeeninja.test  | Staff@12345  |
| Staff | staff2@coffeeninja.test  | Staff@12345  |
| Admin | admin@coffeeninja.test   | Admin@12345  |

## Running tests

```bash
cd backend && npm test
cd frontend && npm test
```

- **Backend:** status transition rules (business rule) and API authentication (security rule).
- **Frontend:** new inquiry form shows field errors without calling the API (UI state), and shows
  the duplicate warning when the API returns 409 (user interaction).

## API overview

All `/api/inquiries` routes require `Authorization: Bearer <token>`.

| Method | Path                         | Purpose                                      |
|--------|------------------------------|----------------------------------------------|
| POST   | /api/auth/login              | Sign in, returns a JWT                       |
| GET    | /api/health                  | Health check                                 |
| POST   | /api/inquiries               | Create an inquiry                            |
| GET    | /api/inquiries               | List (query: `q`, `status`, `page`, `pageSize`) |
| GET    | /api/inquiries/:id           | Get one inquiry                              |
| PATCH  | /api/inquiries/:id/status    | Change status (body: `status`, `version`)    |

Errors always use one shape: `{ "error": { "code", "message", "details" } }`.

## Project structure
backend/
db/ schema.sql, seed.js
src/
routes/ auth, inquiries
middleware/ requireAuth
validation/ zod schemas and parse helper
domain/ status transition rules
frontend/
app/ login, inquiries list, new inquiry, inquiry detail
lib/ API client, auth helper, form validation


See [DECISIONS.md](DECISIONS.md) for design decisions and trade-offs.
