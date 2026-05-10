import { useState } from "react";
import ConfidenceSelector from "./ConfidenceSelector";
import { updateProblem, toggleDone, deleteProblem } from "../services/api";
import "./ProblemCard.css";

/**
 * ProblemCard — renders one problem row with inline revise + actions.
 *
 * Props:
 *   problem  : object   — problem data from API
 *   onRefresh: fn()     — called after any mutation to re-fetch parent list
 */
export default function ProblemCard({ problem: p, onRefresh }) {
  const [revising,  setRevising]  = useState(false);
  const [conf,      setConf]      = useState(p.confidence);
  const [saving,    setSaving]    = useState(false);

  // ── Overdue highlight ─────────────────────────────────────
  const today    = new Date().toISOString().slice(0, 10);
  const isOverdue = !p.is_done && p.next_review < today;
  const isDueToday = !p.is_done && p.next_review === today;

  const statusDot = isOverdue ? "red" : isDueToday ? "yellow" : "green";

  // ── Save revised confidence ───────────────────────────────
  async function handleSaveRevise() {
    setSaving(true);
    try {
      await updateProblem(p.id, { confidence: conf });
      setRevising(false);
      await onRefresh();
    } catch {
      /* swallow — could surface an error toast */
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle done ───────────────────────────────────────────
  async function handleToggleDone() {
    try {
      await toggleDone(p.id);
      await onRefresh();
    } catch { /* no-op */ }
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete() {
    if (!window.confirm(`Delete "${p.title}" permanently?`)) return;
    try {
      await deleteProblem(p.id);
      await onRefresh();
    } catch { /* no-op */ }
  }

  return (
    <div className={`pcard animate-up${p.is_done ? " pcard--done" : ""}`}>

      {/* ── Status dot + title ───────────────────────────── */}
      <div className="pcard-left">
        <span className={`pcard-dot pcard-dot--${statusDot}`} title={
          isOverdue ? "Overdue" : isDueToday ? "Due today" : "Scheduled"
        } />
        <div className="pcard-info">
          <span className="pcard-title">{p.title}</span>
          <div className="pcard-meta">
            <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
            <span className="pcard-topic">{p.topic}</span>
            <span className="pcard-date">📅 {p.next_review}</span>
            <span className="pcard-conf" title="Confidence">⭐ {p.confidence}/5</span>
          </div>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="pcard-actions">
        {!p.is_done && !revising && (
          <button className="btn btn-ghost" onClick={() => setRevising(true)}>
            Revise
          </button>
        )}
        <button
          className="btn btn-success"
          onClick={handleToggleDone}
          title={p.is_done ? "Reactivate" : "Mark done"}
        >
          {p.is_done ? "↩" : "✓"}
        </button>
        <button className="btn btn-danger" onClick={handleDelete} title="Delete">
          🗑
        </button>
      </div>

      {/* ── Inline revise panel ───────────────────────────── */}
      {revising && (
        <div className="pcard-revise animate-up">
          <span className="pcard-revise-label">How well did you remember it?</span>
          <ConfidenceSelector value={conf} onChange={setConf} disabled={saving} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setRevising(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSaveRevise}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save & Reschedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
