from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import chat, orders

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Casa Fusion Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "https://restaurant-chatbot.vercel.app",
        ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(orders.router)