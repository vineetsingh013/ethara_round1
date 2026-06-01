import asyncio
from app.database import async_session_factory
from app.models import Product, Customer, Order, OrderItem, User, UserRole
from app.dependencies import hash_password
from sqlalchemy import select


async def seed():
    async with async_session_factory() as db:
        existing = await db.execute(select(Product).limit(1))
        if existing.scalar_one_or_none():
            print("Data already seeded, skipping.")
            return

        products = [
            Product(name="Wireless Mouse", sku="ELEC-001", price=29.99, quantity=150),
            Product(name="Mechanical Keyboard", sku="ELEC-002", price=89.99, quantity=75),
            Product(name="USB-C Hub 7-in-1", sku="ELEC-003", price=45.50, quantity=200),
            Product(name="27in 4K Monitor", sku="ELEC-004", price=449.99, quantity=30),
            Product(name="Noise Canceling Headphones", sku="AUDIO-001", price=199.99, quantity=60),
            Product(name="Bluetooth Speaker", sku="AUDIO-002", price=79.99, quantity=45),
            Product(name="Ergonomic Office Chair", sku="FURN-001", price=349.00, quantity=20),
            Product(name="Standing Desk Converter", sku="FURN-002", price=249.99, quantity=15),
            Product(name="A4 Premium Notebook", sku="STAT-001", price=12.99, quantity=500),
            Product(name="Ballpoint Pen (Box of 12)", sku="STAT-002", price=8.50, quantity=300),
            Product(name="Stapler", sku="STAT-003", price=6.99, quantity=120),
            Product(name="Shipping Tape (6-pack)", sku="PACK-001", price=14.99, quantity=250),
            Product(name="Bubble Wrap Roll", sku="PACK-002", price=22.99, quantity=80),
            Product(name="Webcam 1080p", sku="ELEC-005", price=59.99, quantity=90),
            Product(name="Desk Lamp LED", sku="FURN-003", price=39.99, quantity=40),
            Product(name="Laptop Stand Aluminum", sku="FURN-004", price=34.99, quantity=65),
            Product(name="External SSD 1TB", sku="ELEC-006", price=109.99, quantity=35),
            Product(name="HDMI Cable 6ft", sku="ELEC-007", price=9.99, quantity=400),
            Product(name="Surge Protector Strip", sku="ELEC-008", price=19.99, quantity=180),
            Product(name="Cork Bulletin Board", sku="STAT-004", price=24.99, quantity=55),
        ]
        db.add_all(products)
        await db.flush()

        customers = [
            Customer(name="Acme Corporation", email="orders@acme.com", phone="+1-555-0100"),
            Customer(name="Globex Industries", email="purchasing@globex.io", phone="+1-555-0101"),
            Customer(name="Initech Solutions", email="procure@initech.co", phone="+1-555-0102"),
            Customer(name="Umbrella Labs", email="supply@umbrella.org", phone="+1-555-0103"),
            Customer(name="Stark Enterprises", email="logistics@stark.com", phone="+1-555-0104"),
        ]
        db.add_all(customers)
        await db.flush()

        orders_data = [
            (customers[0], [(products[0], 10), (products[9], 24)]),
            (customers[1], [(products[3], 2), (products[16], 5)]),
            (customers[2], [(products[1], 8), (products[4], 4), (products[13], 12)]),
            (customers[3], [(products[8], 100), (products[11], 50)]),
            (customers[4], [(products[6], 3), (products[14], 10), (products[15], 8)]),
            (customers[2], [(products[2], 15), (products[17], 60)]),
            (customers[0], [(products[5], 6), (products[7], 1)]),
        ]

        for cust, items in orders_data:
            total = 0.0
            order = Order(customer_id=cust.id, total_amount=0)
            db.add(order)
            await db.flush()

            order_items = []
            for prod, qty in items:
                unit_price = prod.price
                line_total = unit_price * qty
                total += line_total
                prod.quantity -= qty
                order_items.append(OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=unit_price,
                ))

            order.total_amount = round(total, 2)
            db.add_all(order_items)

        await db.flush()

        existing_user = await db.execute(
            select(User).where(User.email == "orders@acme.com")
        )
        if not existing_user.scalar_one_or_none():
            db.add(User(
                email="orders@acme.com",
                password_hash=hash_password("customer123"),
                role=UserRole.customer,
                customer_id=customers[0].id,
            ))

        await db.commit()
        print("Seed data inserted successfully!")
        print(f"  {len(products)} products")
        print(f"  {len(customers)} customers")
        print(f"  {len(orders_data)} orders")


if __name__ == "__main__":
    asyncio.run(seed())
