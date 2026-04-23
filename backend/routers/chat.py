from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from database import get_db
from models import ChatSession, Message, Order
from schemas import ChatRequest
from prompt import SYSTEM_PROMPT
import anthropic, os, re, json

router = APIRouter(prefix="/chat", tags=["chat"])
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def parse_order(text: str):
    """Extract <order>{...}</order> JSON from Claude's response if present."""
    match = re.search(r"<order>(.*?)</order>", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            return None
    return None

@router.post("/")
def chat(payload: ChatRequest, db: DBSession = Depends(get_db)):

    # 1. Get or create session
    session = None
    if payload.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == payload.session_id
        ).first()
    if not session:
        session = ChatSession()
        db.add(session)
        db.commit()
        db.refresh(session)

    # 2. Save user message
    db.add(Message(session_id=session.id, role="user", content=payload.message))
    db.commit()

    # 3. Build conversation history (last 20 messages)
    history = db.query(Message).filter(
        Message.session_id == session.id
    ).order_by(Message.created_at).all()[-20:]

    claude_messages = [{"role": m.role, "content": m.content} for m in history]

    # 4. Call Claude
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=claude_messages
    )
    reply = response.content[0].text

    # 5. Check if reply contains an order
    order_data = parse_order(reply)
    if order_data:
        db.add(Order(
            session_id=session.id,
            items=order_data["items"],
            total=order_data["total"]
        ))
        db.commit()

    # 6. Save assistant reply (strip the <order> tag before storing)
    clean_reply = re.sub(r"<order>.*?</order>", "", reply, flags=re.DOTALL).strip()
    db.add(Message(session_id=session.id, role="assistant", content=clean_reply))
    db.commit()

    return {
        "session_id": session.id,
        "reply": clean_reply,
        "order": order_data   # null if no order placed
    }