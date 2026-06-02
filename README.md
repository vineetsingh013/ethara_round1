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


