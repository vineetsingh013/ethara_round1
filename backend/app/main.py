from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.database import init_db, async_session_factory
from app.models import User, UserRole
from app.dependencies import hash_password
from app.routes import products, customers, orders, auth
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed()
    async with async_session_factory() as db:
        result = await db.execute(
            select(User).where(User.email == "admin@example.com")
        )
        if not result.scalar_one_or_none():
            admin = User(
                email="admin@example.com",
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
            )
            db.add(admin)
            await db.commit()
    yield


app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(orders.portal_router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}
