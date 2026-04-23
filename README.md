# Casa Fusion — AI Restaurant Chatbot

A full-stack AI-powered chatbot for a Mexican fusion restaurant. Customers can ask questions about the menu, place orders, and get instant responses — all through a conversational chat interface. Built with FastAPI, Claude AI, PostgreSQL, and React.

---

## Overview

```
React Frontend  ──►  FastAPI Backend  ──►  Claude API (claude-sonnet)
                          │
                     PostgreSQL
                  (sessions + messages + orders)
```

---

## Features

- **AI-powered conversations** — Powered by Anthropic's Claude, with a custom restaurant persona and menu knowledge baked into the system prompt
- **Online ordering via chat** — Customers can browse the menu and place orders entirely through the chat interface
- **Persistent chat history** — Conversations are saved to PostgreSQL, so returning customers pick up where they left off
- **Order tracking** — Orders are automatically parsed from Claude's responses and saved to the database
- **Session management** — Each user gets a unique session stored in their browser's localStorage

---

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Backend    | Python 3.11+, FastAPI, Uvicorn            |
| AI         | Anthropic Claude API (claude-sonnet-4)    |
| Database   | PostgreSQL, SQLAlchemy ORM, Alembic       |
| Frontend   | React 18, TypeScript, Vite, Axios         |
| Deployment | Railway (backend + DB), Vercel (frontend) |

---

## 📁 Project Structure

```
restaurant-chatbot/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models.py            # DB models: ChatSession, Message, Order
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── prompt.py            # Claude system prompt (restaurant persona + menu)
│   ├── routers/
│   │   ├── chat.py          # POST /chat/ — main chat endpoint
│   │   └── orders.py        # GET/PATCH /orders/ — order management
│   ├── migrations/          # Alembic migration files
│   ├── requirements.txt
│   ├── Procfile             # For Railway deployment
│   └── .env                 # Environment variables (never commit this)
└── frontend/
    ├── src/
    │   ├── App.tsx           # Root component, chat state management
    │   ├── api/
    │   │   └── chat.ts       # Axios API calls to backend
    │   └── components/
    │       ├── MessageBubble.tsx
    │       └── OrderSummary.tsx
    ├── .env                  # VITE_API_URL
    ├── package.json
    └── vite.config.ts
```

---

## Prerequisites

Make sure you have the following installed:

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/LennyBeto/restaurant-chatbot.git
cd restaurant-chatbot
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Create your `.env` file

```bash
cp .env.example .env
```

Fill in the values:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/restaurant_db
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

#### Create the PostgreSQL database

```bash
psql -U postgres
CREATE DATABASE restaurant_db;
\q
```

#### Run database migrations

```bash
alembic upgrade head
```

This creates 3 tables: `chat_sessions`, `messages`, and `orders`.

#### Start the backend server

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`
Interactive API docs at `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Create your `.env` file

```env
VITE_API_URL=http://localhost:8000
```

#### Start the frontend dev server

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🗄️ Database Schema

### `chat_sessions`

| Column     | Type           | Description           |
| ---------- | -------------- | --------------------- |
| id         | VARCHAR (UUID) | Primary key           |
| created_at | TIMESTAMP      | Session creation time |

### `messages`

| Column     | Type      | Description                 |
| ---------- | --------- | --------------------------- |
| id         | INTEGER   | Primary key                 |
| session_id | VARCHAR   | Foreign key → chat_sessions |
| role       | VARCHAR   | `"user"` or `"assistant"`   |
| content    | TEXT      | Message body                |
| created_at | TIMESTAMP | Message timestamp           |

### `orders`

| Column     | Type      | Description                                   |
| ---------- | --------- | --------------------------------------------- |
| id         | INTEGER   | Primary key                                   |
| session_id | VARCHAR   | Foreign key → chat_sessions                   |
| items      | JSON      | `[{"name": "...", "qty": 1, "price": 14.00}]` |
| total      | FLOAT     | Order total in USD                            |
| status     | VARCHAR   | `pending`, `confirmed`, `cancelled`           |
| created_at | TIMESTAMP | Order timestamp                               |

---

## 🔌 API Endpoints

### Chat

#### `POST /chat/`

Send a message and get an AI response.

**Request body:**

```json
{
  "session_id": "optional-existing-session-uuid",
  "message": "I'd like to order 2 Al Pastor Tacos"
}
```

**Response:**

```json
{
  "session_id": "abc-123-uuid",
  "reply": "¡Perfecto! Here's your order summary...",
  "order": {
    "items": [{ "name": "Al Pastor Tacos", "qty": 2, "price": 14.0 }],
    "total": 28.0
  }
}
```

> `order` is `null` if the message didn't trigger an order placement.

---

#### `GET /chat/history/{session_id}`

Retrieve full chat history for a session.

**Response:**

```json
{
  "id": "abc-123-uuid",
  "created_at": "2026-04-23T10:00:00",
  "messages": [
    {
      "role": "user",
      "content": "What tacos do you have?",
      "created_at": "..."
    },
    {
      "role": "assistant",
      "content": "We have three taco options...",
      "created_at": "..."
    }
  ]
}
```

---

### Orders

#### `GET /orders/{session_id}`

Get all orders for a session.

#### `PATCH /orders/{order_id}/confirm`

Confirm a pending order.

**Response:**

```json
{ "status": "confirmed", "order_id": 1 }
```

---

## Prompt Engineering

The bot's personality, menu knowledge, and ordering rules are defined in `backend/prompt.py`. Key elements:

- **Persona** — Named "Maya", warm tone, occasional Spanish phrases
- **Structured menu** — Items, descriptions, and prices formatted clearly so Claude can reference them accurately
- **Ordering rules** — Claude is instructed to collect all items first, confirm with a summary, then output a structured `<order>...</order>` JSON block that the backend parses automatically
- **Guardrails** — Never invent menu items or prices not listed

To customize for a different restaurant, only `prompt.py` needs to be updated.

---

## Deployment

### Backend — Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway add postgresql      # provisions a free Postgres instance
railway up
```

Add a `Procfile` in `/backend`:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set environment variables in the Railway dashboard:

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=<auto-provided by Railway>
```

Run migrations on Railway:

```bash
railway run alembic upgrade head
```

---

### Frontend — Vercel

```bash
cd frontend
npm run build
npx vercel --prod
```

Set in Vercel dashboard → Environment Variables:

```
VITE_API_URL=https://your-app.railway.app
```

---

## Testing the API (without frontend)

Using the Swagger UI at `http://localhost:8000/docs`, or with curl:

```bash
# Start a new session
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What tacos do you have?"}'

# Continue existing session
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"session_id": "your-session-id", "message": "I'll take 2 Baja Fish Tacos"}'
```

---

## Environment Variables Reference

| Variable            | Required | Description                                       |
| ------------------- | -------- | ------------------------------------------------- |
| `DATABASE_URL`      | ✅       | PostgreSQL connection string                      |
| `ANTHROPIC_API_KEY` | ✅       | Your Anthropic API key from console.anthropic.com |

---

## Known Limitations (MVP)

- No user authentication — sessions are identified by UUID stored in localStorage
- No payment gateway integration — orders are confirmed in-chat but not processed
- Menu is hardcoded in the system prompt — a future version could load from a DB table

---

## Roadmap

- [ ] Admin dashboard to view and manage orders
- [ ] Menu management via database (no prompt editing needed)
- [ ] Payment integration (Stripe or M-Pesa)
- [ ] WhatsApp channel via Twilio
- [ ] Multi-language support (English + Spanish)

---

## Author

**Beto Lenny**
GitHub: [github.com/LennyBeto](https://github.com/LennyBeto)

---

## License

MIT License — free to use and modify.
