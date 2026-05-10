import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import StatCard      from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState    from "../components/EmptyState";
import {
  getSummary, getStreak, getProblemsOverTime, getWeakTopics,
} from "../services/api";

// ── Custom Recharts tooltip ───────────────────────────────────────────────────
function DarkTooltip({ active, payload, label, valueLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1d27",
      border: "1px solid rgba(124,109,250,.35)",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: ".82rem",
      color: "#e2e8f0",
    }}>
      <p style={{ color: "#94a3b8", marginBottom: 3 }}>{label}</p>
      <p><strong style={{ color: "#7c6dfa" }}>{payload[0].value}</strong> {valueLabel}</p>
    </div>
  );
}

// ── Bar colour by confidence ──────────────────────────────────────────────────
function barColour(conf) {
  if (conf < 2.5) return "#f87171";
  if (conf < 3.5) return "#fbbf24";
  return "#34d399";
}

// ── Streak helper message ─────────────────────────────────────────────────────
function streakMsg(cur, best) {
  if (cur === 0)       return ["No active streak", "Solve a problem today to start one! 🚀"];
  if (cur >= best && best > 1) return ["Personal best! 🏆", `${cur} days straight`];
  if (cur >= 7)        return ["On fire! 🔥", `${best - cur} days to best`];
  return [`${cur}-day streak`, `Best: ${best} days`];
}

export default function DashboardPage() {
  const [summary,   setSummary]   = useState(null);
  const [streak,    setStreak]    = useState(null);
  const [overTime,  setOverTime]  = useState([]);
  const [weakTopics, setWeak]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, st, ot, wt] = await Promise.all([
        getSummary(),
        getStreak(),
        getProblemsOverTime(),
        getWeakTopics(),
      ]);
      setSummary(s);
      setStreak(st);
      // Keep only days with solves + last 14 for readability
      setOverTime(ot.slice(-30));
      setWeak(wt);
    } catch {
      setError("Could not load analytics. Is the Flask server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <div className="page"><LoadingSpinner text="Loading analytics…" /></div>;

  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
    </div>
  );

  const [smsg, ssub] = streakMsg(streak?.current_streak ?? 0, streak?.longest_streak ?? 0);

  // Format date labels for X axis: "Mar 28" → "28"
  const fmtDate = (d) => d?.slice(5).replace("-", "/");  // "2026-03-28" → "03/28"

  return (
    <div className="page-wide">

      {/* ── Toolbar ───────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.3rem" }}>Analytics</h2>
          <p style={{ color: "var(--text-muted)", fontSize: ".84rem", marginTop: 3 }}>Your coding progress at a glance</p>
        </div>
        <button
          onClick={fetchAll}
          className="btn btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Summary cards ────────────────────────────── */}
      <p className="section-label">📋 Overview</p>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon="📚" label="Total Problems" value={summary?.total_problems} />
        <StatCard icon="✅" label="Active"          value={summary?.active}         accent="green" />
        <StatCard icon="🔥" label="Due Today"       value={summary?.due_today}      accent="yellow" />
        <StatCard icon="⭐" label="Avg Confidence"  value={summary?.avg_confidence?.toFixed(1)} />
      </div>

      {/* ── Streak banner ────────────────────────────── */}
      <p className="section-label">🔥 Streak</p>
      <div style={{
        background: "linear-gradient(135deg,rgba(124,109,250,.12),rgba(52,211,153,.07))",
        border: "1px solid rgba(124,109,250,.28)",
        borderRadius: "var(--radius)",
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 24,
        flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: "2.8rem",
          filter: streak?.current_streak > 0 ? "drop-shadow(0 0 10px rgba(251,191,36,.5))" : "grayscale(1) opacity(.35)",
        }}>🔥</span>

        <div style={{ display: "flex", gap: 32, flex: 1, flexWrap: "wrap" }}>
          {[
            { val: streak?.current_streak, lbl: "Current Streak", clr: "#fbbf24" },
            { val: streak?.longest_streak, lbl: "Longest Streak",  clr: "#7c6dfa" },
            { val: streak?.total_active_days, lbl: "Days Active",  clr: "#34d399" },
          ].map(({ val, lbl, clr }) => (
            <div key={lbl}>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, lineHeight: 1, color: clr, textShadow: `0 0 18px ${clr}55` }}>{val ?? "—"}</div>
              <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: "rgba(251,191,36,.1)",
          border: "1px solid rgba(251,191,36,.22)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 18px",
          textAlign: "center",
          flexShrink: 0,
        }}>
          <div style={{ fontWeight: 700, color: "var(--yellow)", fontSize: ".95rem" }}>{smsg}</div>
          <div style={{ fontSize: ".72rem", color: "var(--text-muted)", marginTop: 2 }}>{ssub}</div>
        </div>
      </div>

      {/* ── Charts row ───────────────────────────────── */}
      <p className="section-label">📈 Activity</p>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>

        {/* Line chart — problems over time */}
        <div className="card" style={{ minWidth: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: ".95rem" }}>Problems Solved per Day</div>
            <div style={{ fontSize: ".74rem", color: "var(--text-muted)", marginTop: 2 }}>Last 30 days</div>
          </div>
          {overTime.every((d) => d.count === 0) ? (
            <EmptyState icon="📈" title="No data yet" message="Start adding problems to see trends." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={overTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<DarkTooltip valueLabel="problems" />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7c6dfa"
                  strokeWidth={2.5}
                  dot={(props) => props.payload.count > 0
                    ? <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill="#7c6dfa" stroke="none" />
                    : <g key={props.key} />
                  }
                  activeDot={{ r: 6, fill: "#7c6dfa", stroke: "none" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart — weak topics */}
        <div className="card" style={{ minWidth: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: ".95rem" }}>Weak Topics</div>
            <div style={{ fontSize: ".74rem", color: "var(--text-muted)", marginTop: 2 }}>
              Sorted by avg confidence ↑
            </div>
          </div>
          {weakTopics.length === 0 ? (
            <EmptyState icon="🧩" title="No topic data" message="Add problems with topics to see analysis." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={weakTopics}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 5]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="topic"
                    width={90}
                    tick={{ fontSize: 11, fill: "#e2e8f0" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: "#1a1d27", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 14px", fontSize: ".8rem" }}>
                          <p style={{ fontWeight: 600, color: "#e2e8f0" }}>{d.topic}</p>
                          <p style={{ color: "#94a3b8" }}>Avg confidence: <strong>{d.avg_confidence}</strong>/5</p>
                          <p style={{ color: "#94a3b8" }}>Problems: {d.problem_count}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="avg_confidence" radius={[0, 4, 4, 0]}>
                    {weakTopics.map((entry, i) => (
                      <Cell key={i} fill={barColour(entry.avg_confidence)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Mini legend table */}
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                {weakTopics.slice(0, 5).map((t) => (
                  <div key={t.topic} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem" }}>
                    <span style={{ flex: 1, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</span>
                    <span style={{ color: "var(--text-muted)" }}>{t.problem_count} probs</span>
                    <span style={{
                      padding: "1px 8px", borderRadius: 20, fontWeight: 700, fontSize: ".68rem",
                      background: `${barColour(t.avg_confidence)}22`,
                      color: barColour(t.avg_confidence),
                    }}>
                      {t.avg_confidence} / 5
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Responsive chart grid collapse */}
      <style>{`
        @media (max-width: 720px) {
          .charts-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
