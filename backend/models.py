from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    messages   = relationship("Message", back_populates="session",
                              order_by="Message.created_at")
    orders     = relationship("Order", back_populates="session")

class Message(Base):
    __tablename__ = "messages"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    role       = Column(String, nullable=False)   # "user" or "assistant"
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    session    = relationship("ChatSession", back_populates="messages")

class Order(Base):
    __tablename__ = "orders"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    items      = Column(JSON, nullable=False)   # [{"name": "Taco", "qty": 2, "price": 12.00}]
    total      = Column(Float, nullable=False)
    status     = Column(String, default="pending")  # pending, confirmed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    session    = relationship("ChatSession", back_populates="orders")