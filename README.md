# Inventory & Order Management System

A full-stack inventory and order management application with admin and customer portals, JWT authentication, order cancellation workflows, and day/night theme support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, React Router 6 |
| **Backend** | Python 3.12 + FastAPI |
| **Database** | PostgreSQL 16 (via asyncpg + SQLAlchemy 2.0 async) |
| **Auth** | JWT (python-jose) + bcrypt (passlib) |
| **Docker** | Multi-stage builds, slim images, docker compose |

## Features

- **Admin Portal** — Full CRUD for products, customers, orders; dashboard with aggregate stats; approve/reject cancellation requests
- **Customer Portal** — Self-service profile, place orders, view order history, request cancellations
- **JWT Authentication** — Role-based (admin / customer) with auto-seeded admin account
- **Order Cancellation Workflow** — Customer requests → Admin approves (stock restored) or rejects
- **Day/Night Theme** — Persistent toggle with warm earthy color palette
- **Responsive Design** — Mobile sidebar overlay, collapsible sidebar, adaptive grid layouts
- **Fully Containerized** — Docker Compose with 3 services (db, backend, frontend)

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point, lifespan, CORS
│   │   ├── database.py          # Async engine, session factory, get_db
│   │   ├── models.py            # SQLAlchemy models (User, Product, Customer, Order, OrderItem)
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── dependencies.py      # JWT, password hashing, auth dependencies
│   │   └── routes/
│   │       ├── auth.py          # /auth/register, /auth/login, /auth/me
│   │       ├── products.py      # CRUD /products/ (SKU-based)
│   │       ├── customers.py     # CRUD /customers/ + /customers/me
│   │       └── orders.py        # CRUD /orders/ + /orders/my/ + cancellation
│   ├── seed.py                  # Sample data seeder
│   ├── Dockerfile               # python:3.12-slim
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root layout, auth routing, admin/customer portals
│   │   ├── App.css              # Full responsive styles with theme variables
│   │   ├── api.js               # Centralized fetch client with JWT headers
│   │   ├── components/
│   │   │   ├── AuthContext.jsx   # Auth state, login/register/logout
│   │   │   ├── ThemeContext.jsx  # Day/night toggle with localStorage persistence
│   │   │   ├── Notification.jsx # Toast notification system
│   │   │   ├── Loader.jsx       # Spinner component with branding
│   │   │   ├── Login.jsx        # Login form
│   │   │   ├── Register.jsx     # Customer self-registration
│   │   │   ├── Dashboard.jsx    # Admin dashboard with clickable cards
│   │   │   ├── ProductManagement.jsx
│   │   │   ├── CustomerManagement.jsx
│   │   │   ├── OrderManagement.jsx  # Admin order list + detail with approve/reject
│   │   │   └── CustomerPortal.jsx   # Customer dashboard, orders, place order
│   │   └── main.jsx             # React entry point
│   ├── Dockerfile               # node:20-alpine build → nginx:1.27-alpine serve
│   ├── nginx.conf               # Reverse proxy /api/ → backend
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml           # 3-service orchestration with named volume
└── README.md
```

## Docker Setup (Mandatory)

The project is fully containerized. All three services run via Docker Compose.

### Prerequisites

- Docker Engine 24+
- Docker Compose v2+

### Quick Start

```bash
# Clone and run
docker compose build
docker compose up -d

# Application available at: http://localhost
# Backend API at: http://localhost:8000
```

### Services

| Service | Image | Port | Base Image |
|---------|-------|------|-----------|
| `db` | postgres:16-alpine | 5432 | Alpine Linux |
| `backend` | custom | 8000 | python:3.12-slim |
| `frontend` | custom | 80 | nginx:1.27-alpine |

### Volumes

- `postgres_data` — Named volume for PostgreSQL persistence (driver: local)

### Environment Variables

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `POSTGRES_DB` | db | `inventory_db` | Database name |
| `POSTGRES_USER` | db | `postgres` | Database user |
| `POSTGRES_PASSWORD` | db | `postgres` | Database password |
| `DATABASE_URL` | backend | `postgresql+asyncpg://postgres:postgres@db:5432/inventory_db` | Async SQLAlchemy connection string |
| `VITE_API_URL` | frontend | `/api` | API base path (proxied via nginx) |

**Note:** No credentials are hardcoded in the application code. Production deployments should override these via environment variables or a `.env` file.

### Rebuilding After Changes

```bash
# Backend only
docker compose build backend && docker compose up -d

# Frontend only
docker compose build frontend && docker compose up -d

# Both
docker compose build && docker compose up -d
```

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL (e.g., via Docker)
docker run -d --name pg -e POSTGRES_DB=inventory_db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine

# Run seed (optional — adds sample data)
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Customer self-registration |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/auth/me` | JWT | Current user profile |
| GET | `/products/` | JWT | List all products |
| GET | `/products/{sku}` | JWT | Get product by SKU |
| POST | `/products/` | Admin | Create product |
| PUT | `/products/{sku}` | Admin | Update product |
| DELETE | `/products/{sku}` | Admin | Delete product |
| GET | `/customers/` | Admin | List all customers |
| GET | `/customers/{id}` | Admin | Get customer |
| POST | `/customers/` | Admin | Create customer (optional password creates login) |
| DELETE | `/customers/{id}` | Admin | Delete customer |
| GET | `/customers/me` | JWT | Own profile (customer) |
| GET | `/orders/` | Admin | List all orders |
| GET | `/orders/{id}` | Admin | Get order detail |
| POST | `/orders/` | Admin | Create order |
| DELETE | `/orders/{id}` | Admin | Delete order |
| POST | `/orders/{id}/approve-cancellation` | Admin | Approve cancellation (restores stock) |
| POST | `/orders/{id}/reject-cancellation` | Admin | Reject cancellation |
| GET | `/orders/my/` | Customer | My orders |
| GET | `/orders/my/{id}` | Customer | My order detail |
| POST | `/orders/my/` | Customer | Place order |
| POST | `/orders/my/{id}/cancel-request` | Customer | Request cancellation |
| GET | `/orders/dashboard` | Admin | Dashboard aggregate stats |

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `admin123` |
| **Customer** | `orders@acme.com` | `customer123` |

The admin account is auto-seeded on first startup. Sample data (20 products, 5 customers, 7 orders) is added by the seed script when the database is empty.

## Deployment

### Backend (Render / Railway / Fly.io)

#### Render

1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → New + → Web Service
3. Connect your repository, set:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Add environment variables:
   - `DATABASE_URL` — point to your managed PostgreSQL instance
   - `SECRET_KEY` — (optional, defaults to a fixed key; set your own for production)
5. Create a PostgreSQL database via Render Dashboard → New + → PostgreSQL
6. Copy the "Internal Database URL" and set it as `DATABASE_URL`
7. Deploy

#### Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the repo, set root directory to `backend`
4. Add a PostgreSQL plugin (Railway auto-provides the `DATABASE_URL`)
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Deploy

### Frontend (Vercel / Netlify)

The frontend connects to the backend via `VITE_API_URL`. For production, set this to your deployed backend URL.

#### Vercel

```bash
npm install -g vercel
cd frontend
vercel --prod
```

During setup:
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- Set environment variable `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.onrender.com`)

Or connect your GitHub repo in the Vercel dashboard with the root directory set to `frontend`.

#### Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
3. Select repo, set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist` (or `dist` if base dir is set)
4. Add environment variable:
   - `VITE_API_URL` = your deployed backend URL
5. Deploy

### Production Checklist

- [ ] Set a strong `SECRET_KEY` environment variable on the backend
- [ ] Use a managed PostgreSQL instance (Render Postgres, Railway PG, Aiven, etc.)
- [ ] Update `VITE_API_URL` on the frontend to point to the deployed backend
- [ ] Set strong database credentials (not `postgres`/`postgres`)
- [ ] Enable CORS origins for your frontend domain in `backend/app/main.py`
- [ ] Run the seed script manually on fresh databases, or let the auto-seed run on first startup
