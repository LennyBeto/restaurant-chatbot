import { Order } from "../api/chat";

export default function OrderSummary({ order }: { order: Order }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🧾 Order Summary</h3>
      {order.items.map((item, i) => (
        <div key={i} style={styles.row}>
          <span>
            {item.qty}x {item.name}
          </span>
          <span>${(item.qty * item.price).toFixed(2)}</span>
        </div>
      ))}
      <div style={styles.total}>
        <strong>Total</strong>
        <strong>${order.total.toFixed(2)}</strong>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#1e3a2f",
    border: "1px solid #2d6a4f",
    borderRadius: 12,
    padding: 16,
    margin: "10px 0",
    color: "#fff",
  },
  title: { marginBottom: 10, color: "#52b788" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    fontSize: 14,
  },
  total: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #2d6a4f",
    marginTop: 8,
    paddingTop: 8,
    fontSize: 15,
  },
};
