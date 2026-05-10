/**
 * EmptyState — shown when a list has no data.
 *
 * Props:
 *   icon    : string  (emoji)
 *   title   : string
 *   message : string
 */
export default function EmptyState({ icon = "📭", title, message }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "52px 20px",
        gap: 10,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "2.6rem", lineHeight: 1 }}>{icon}</span>
      {title && (
        <p style={{ fontWeight: 600, fontSize: ".95rem", color: "var(--text)" }}>{title}</p>
      )}
      {message && (
        <p style={{ color: "var(--text-muted)", fontSize: ".84rem", maxWidth: 300 }}>{message}</p>
      )}
    </div>
  );
}
