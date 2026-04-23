from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str

class MessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    items: Any
    total: float
    status: str
    created_at: datetime
    class Config:
        from_attributes = True