from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole, Customer
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.dependencies import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    existing_customer = await db.execute(
        select(Customer).where(Customer.email == data.email)
    )
    customer = existing_customer.scalar_one_or_none()
    if not customer:
        customer = Customer(name=data.name, email=data.email, phone=data.phone)
        db.add(customer)
        await db.flush()
        await db.refresh(customer)

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.customer,
        customer_id=customer.id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token({
        "user_id": user.id,
        "role": user.role.value,
        "customer_id": user.customer_id,
    })
    return TokenResponse(
        access_token=token,
        role=user.role.value,
        customer_id=user.customer_id,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({
        "user_id": user.id,
        "role": user.role.value,
        "customer_id": user.customer_id,
    })
    return TokenResponse(
        access_token=token,
        role=user.role.value,
        customer_id=user.customer_id,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
