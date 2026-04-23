import { useState, useEffect, useRef } from "react";
import { sendMessage, Message, Order } from "./api/chat";
import OrderSummary from "./components/OrderSummary";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem("session_id"),
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const data = await sendMessage(text, sessionId);
      if (!sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem("session_id", data.session_id);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      if (data.order) setOrders((prev) => [...prev, data.order!]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>🌮 Casa Fusion — Order & Chat</div>

        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "#c0522b" : "#1e293b",
              }}
            >
              {m.content}
            </div>
          ))}
          {orders.map((o, i) => (
            <OrderSummary key={i} order={o} />
          ))}
          {loading && (
            <div style={{ ...styles.bubble, background: "#1e293b" }}>
              Maya is typing…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about the menu or place an order…"
          />
          <button style={styles.btn} onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 720,
    height: "92vh",
    display: "flex",
    flexDirection: "column",
    background: "#1a0e06",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    padding: "18px 24px",
    background: "#3d1505",
    color: "#e8a923",
    fontSize: 18,
    fontWeight: 700,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bubble: {
    maxWidth: "72%",
    padding: "10px 16px",
    borderRadius: 14,
    color: "#fff",
    fontSize: 15,
    lineHeight: 1.55,
  },
  inputRow: {
    display: "flex",
    gap: 10,
    padding: 16,
    borderTop: "1px solid #2e1e12",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #2e1e12",
    background: "#0f172a",
    color: "#fff",
    fontSize: 15,
    outline: "none",
  },
  btn: {
    padding: "10px 20px",
    background: "#c0522b",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
};
