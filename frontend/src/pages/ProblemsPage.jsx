import { useState, useEffect, useCallback } from "react";
import ProblemCard   from "../components/ProblemCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState    from "../components/EmptyState";
import { getProblems, getDueToday, getUpcoming } from "../services/api";

const TABS = [
  { key: "due",      label: "🔥 Due Today" },
  { key: "upcoming", label: "📅 Upcoming"  },
  { key: "active",   label: "✅ Active"    },
  { key: "done",     label: "☑️ Done"     },
];

const EMPTY = {
  due:      { icon: "🎉", title: "Nothing due today!", message: "Great job — come back tomorrow." },
  upcoming: { icon: "📅", title: "No upcoming problems.",  message: "Add problems from the Tracker page." },
  active:   { icon: "📚", title: "No active problems.",   message: "Start by adding a problem." },
  done:     { icon: "🏆", title: "None completed yet.",    message: "Mark problems as done after reviewing." },
};

export default function ProblemsPage() {
  const [tab,      setTab]      = useState("due");
  const [due,      setDue]      = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [all,      setAll]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dueData, upcomingData, allData] = await Promise.all([
        getDueToday(),
        getUpcoming(),
        getProblems(),
      ]);
      setDue(dueData);
      setUpcoming(upcomingData);
      setAll(allData);
    } catch {
      setError("Could not load problems. Is the Flask server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derive lists from fetched data ────────────────────────
  const active = all.filter((p) => !p.is_done);
  const done   = all.filter((p) => p.is_done);

  const listMap = { due, upcoming, active, done };
  const problems = listMap[tab] ?? [];

  // ── Tab counts ────────────────────────────────────────────
  const counts = {
    due:      due.length,
    upcoming: upcoming.length,
    active:   active.length,
    done:     done.length,
  };

  return (
    <div className="page">

      {/* ── Page header ─────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: "1.3rem" }}>Problems</h2>
        <p style={{ color: "var(--text-muted)", fontSize: ".84rem", marginTop: 3 }}>
          {loading ? "Loading…" : `${all.length} total · ${due.length} due today`}
        </p>
      </div>

      {/* ── Error banner ────────────────────────────────── */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Tab bar ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border: `1px solid ${tab === key ? "var(--accent)" : "var(--border)"}`,
              background: tab === key ? "var(--accent)" : "var(--surface-2)",
              color: tab === key ? "#fff" : "var(--text-muted)",
              fontSize: ".82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all var(--tr)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {label}
            {counts[key] > 0 && (
              <span style={{
                background: tab === key ? "rgba(255,255,255,.25)" : "rgba(124,109,250,.2)",
                color: tab === key ? "#fff" : "var(--accent)",
                borderRadius: 20,
                padding: "1px 7px",
                fontSize: ".72rem",
                fontWeight: 700,
              }}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={fetchAll}
          style={{
            marginLeft: "auto",
            padding: "7px 14px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: ".78rem",
            cursor: "pointer",
            transition: "all var(--tr)",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner />
      ) : problems.length === 0 ? (
        <EmptyState {...EMPTY[tab]} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} onRefresh={fetchAll} />
          ))}
        </div>
      )}
    </div>
  );
}
