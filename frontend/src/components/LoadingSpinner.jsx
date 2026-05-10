/** Centred spinning ring indicator */
export default function LoadingSpinner({ text = "Loading…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px", gap: 14 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
          animation: "spin .75s linear infinite",
        }}
      />
      <p style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{text}</p>
    </div>
  );
}
