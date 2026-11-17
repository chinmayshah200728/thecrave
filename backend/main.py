import uuid
import datetime
from typing import List, Literal, Optional
from fastapi import FastAPI, HTTPException, Response, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="The Fresh Crave API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dish prices & delivery config (mirrors frontend)
MENU = {
    "avocado-toast": {"name": "Sourdough Avocado Toast", "price": 380},
    "harvest-bowl": {"name": "Emerald Harvest Bowl", "price": 420},
    "emerald-arborio": {"name": "Emerald Arborio", "price": 540},
    "carrot-veloute": {"name": "Roasted Carrot & Ginger Velouté", "price": 340},
    "coconut-cooler": {"name": "Coconut Espresso Cooler", "price": 280},
    "pistachio-affogato": {"name": "Pistachio Affogato", "price": 320},
    "masala-chai": {"name": "Kulhad Masala Chai", "price": 120},
    "truffle-fries": {"name": "Rosemary Truffle Fries", "price": 190},
    "berry-parfait": {"name": "Berry Granola Parfait", "price": 240},
}
FREE_DELIVERY_OVER = 500
DELIVERY_FEE = 49
KITCHEN_PIN = "1234"
SESSION_COOKIE_NAME = "kitchen_session"

# Models
OrderStatus = Literal["received", "preparing", "out_for_delivery", "delivered"]
PaymentMethod = Literal["cash", "upi"]

class OrderItemIn(BaseModel):
    item_id: str
    qty: int = Field(gt=0, le=20)

class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2)
    phone: str = Field(min_length=10, max_length=10)
    address: str = Field(min_length=8)
    note: str = ""
    payment_method: PaymentMethod
    items: List[OrderItemIn] = Field(min_items=1)

class OrderItem(BaseModel):
    item_id: str
    name: str
    price: int
    qty: int

class Order(BaseModel):
    id: str
    order_number: str
    customer_name: str
    phone: str
    address: str
    note: str
    payment_method: PaymentMethod
    items: List[OrderItem]
    subtotal: int
    delivery_fee: int
    total: int
    status: OrderStatus
    created_at: str
    updated_at: str

class StatusUpdate(BaseModel):
    status: OrderStatus

class PinLogin(BaseModel):
    pin: str

class KitchenSession(BaseModel):
    authed: bool

# In-memory database
orders_db: dict[str, Order] = {}
order_counter = 1001

@app.post("/api/orders", response_model=Order)
def create_order(payload: OrderCreate):
    global order_counter
    order_items: List[OrderItem] = []
    subtotal = 0
    for item in payload.items:
        if item.item_id not in MENU:
            raise HTTPException(status_code=400, detail=f"Unknown item {item.item_id}")
        dish = MENU[item.item_id]
        order_items.append(OrderItem(
            item_id=item.item_id,
            name=dish["name"],
            price=dish["price"],
            qty=item.qty,
        ))
        subtotal += dish["price"] * item.qty

    delivery_fee = 0 if subtotal >= FREE_DELIVERY_OVER or subtotal == 0 else DELIVERY_FEE
    total = subtotal + delivery_fee
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    order_id = str(uuid.uuid4())
    order_number = f"TFC-{order_counter}"
    order_counter += 1

    order = Order(
        id=order_id,
        order_number=order_number,
        customer_name=payload.customer_name,
        phone=payload.phone,
        address=payload.address,
        note=payload.note,
        payment_method=payload.payment_method,
        items=order_items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        status="received",
        created_at=now,
        updated_at=now,
    )
    orders_db[order_id] = order
    return order

@app.get("/api/orders/{order_id}", response_model=Order)
def get_order(order_id: str):
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    return orders_db[order_id]

@app.get("/api/kitchen/me", response_model=KitchenSession)
def kitchen_me(request: Request):
    session = request.cookies.get(SESSION_COOKIE_NAME)
    return KitchenSession(authed=(session == "authed_kitchen_session"))

@app.post("/api/kitchen/login", response_model=KitchenSession)
def kitchen_login(payload: PinLogin, response: Response):
    if payload.pin == KITCHEN_PIN:
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value="authed_kitchen_session",
            httponly=True,
            samesite="lax",
        )
        return KitchenSession(authed=True)
    raise HTTPException(status_code=401, detail="Wrong PIN")

@app.post("/api/kitchen/logout", response_model=KitchenSession)
def kitchen_logout(response: Response):
    response.delete_cookie(SESSION_COOKIE_NAME)
    return KitchenSession(authed=False)

def require_kitchen_auth(request: Request):
    session = request.cookies.get(SESSION_COOKIE_NAME)
    if session != "authed_kitchen_session":
        raise HTTPException(status_code=401, detail="Kitchen PIN required")

@app.get("/api/kitchen/orders", response_model=List[Order])
def get_kitchen_orders(request: Request):
    require_kitchen_auth(request)
    return sorted(orders_db.values(), key=lambda o: o.created_at, reverse=True)

@app.patch("/api/kitchen/orders/{order_id}/status", response_model=Order)
def update_kitchen_order_status(order_id: str, payload: StatusUpdate, request: Request):
    require_kitchen_auth(request)
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    order = orders_db[order_id]
    order.status = payload.status
    order.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return order

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
