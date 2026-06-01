from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import OrderCreate, OrderResponse, OrderItemResponse, DashboardResponse

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func

    products_count = await db.execute(select(func.count(Product.id)))
    customers_count = await db.execute(select(func.count(Customer.id)))
    orders_count = await db.execute(select(func.count(Order.id)))
    low_stock = await db.execute(
        select(Product).where(Product.quantity < 10)
    )
    low_stock_products = len(low_stock.scalars().all())

    return DashboardResponse(
        total_products=products_count.scalar(),
        total_customers=customers_count.scalar(),
        total_orders=orders_count.scalar(),
        low_stock_products=low_stock_products,
    )


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    customer_result = await db.execute(
        select(Customer).where(Customer.id == order_data.customer_id)
    )
    customer = customer_result.scalar_one_or_none()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    total_amount = 0.0
    order_items_data = []

    for item in order_data.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )

        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. "
                f"Available: {product.quantity}, requested: {item.quantity}",
            )

        line_total = product.price * item.quantity
        total_amount += line_total

        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
        })

        product.quantity -= item.quantity

    db_order = Order(
        customer_id=order_data.customer_id,
        total_amount=round(total_amount, 2),
    )
    db.add(db_order)
    await db.flush()

    for item_data in order_items_data:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
        )
        db.add(db_item)

    await db.flush()
    await db.refresh(db_order)

    return await _build_order_response(db_order, db)


@router.get("/", response_model=List[OrderResponse])
async def list_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return [
        await _build_order_response(order, db) for order in orders
    ]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return await _build_order_response(order, db)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order_id)
    )
    items = items_result.scalars().all()

    for item in items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if product:
            product.quantity += item.quantity

    await db.delete(order)
    await db.flush()


async def _build_order_response(order: Order, db: AsyncSession):
    customer_result = await db.execute(
        select(Customer).where(Customer.id == order.customer_id)
    )
    customer = customer_result.scalar_one_or_none()

    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = items_result.scalars().all()

    item_responses = []
    for item in items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        item_responses.append(OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            product_name=product.name if product else None,
        ))

    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=customer.name if customer else None,
        total_amount=order.total_amount,
        items=item_responses,
        created_at=order.created_at,
    )
