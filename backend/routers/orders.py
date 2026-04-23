from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Order
from schemas import OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/{session_id}", response_model=list[OrderOut])
def get_orders(session_id: str, db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.session_id == session_id).all()

@router.patch("/{order_id}/confirm")
def confirm_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    order.status = "confirmed"
    db.commit()
    return {"status": "confirmed", "order_id": order_id}