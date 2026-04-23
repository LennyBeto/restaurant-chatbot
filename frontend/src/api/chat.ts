import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  items: OrderItem[];
  total: number;
}

export async function sendMessage(
  message: string,
  sessionId: string | null,
): Promise<{ session_id: string; reply: string; order: Order | null }> {
  const { data } = await axios.post(`${BASE}/chat/`, {
    message,
    session_id: sessionId,
  });
  return data;
}
