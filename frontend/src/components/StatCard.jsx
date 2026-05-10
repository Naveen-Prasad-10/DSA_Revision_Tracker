/**
 * StatCard — headline number card for the dashboard.
 *
 * Props:
 *   icon     : string (emoji)
 *   value    : string | number
 *   label    : string
 *   accent   : "default" | "green" | "yellow" | "red"
 */
const COLOR_MAP = {
  default: "var(--accent)",
  green:   "var(--green)",
  yellow:  "var(--yellow)",
  red:     "var(--red)",
};

export default function StatCard({ icon, value, label, accent = "default" }) {
  return (
    <div className="card animate-up" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1, color: COLOR_MAP[accent] }}>
        {value ?? "—"}
      </span>
      <span style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}
