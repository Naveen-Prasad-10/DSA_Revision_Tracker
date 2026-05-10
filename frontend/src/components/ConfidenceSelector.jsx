/**
 * ConfidenceSelector — 5 pill buttons (1–5).
 *
 * Props:
 *   value    : number   — currently selected confidence
 *   onChange : fn(n)    — called when user clicks a button
 *   disabled : bool     — grey out while saving
 */
export default function ConfidenceSelector({ value, onChange, disabled }) {
  const labels = { 1: "Forgot", 2: "Hard", 3: "OK", 4: "Good", 5: "Easy" };

  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          title={labels[n]}
          style={{
            flex: 1,
            minWidth: 40,
            padding: "9px 4px",
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${value === n ? "var(--accent)" : "var(--border)"}`,
            background: value === n ? "var(--accent)" : "var(--surface-2)",
            color: value === n ? "#fff" : "var(--text-muted)",
            fontWeight: 700,
            fontSize: ".9rem",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all var(--tr)",
            boxShadow: value === n ? "0 0 12px var(--accent-glow)" : "none",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
