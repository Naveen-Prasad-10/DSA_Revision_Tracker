/**
 * services/api.js
 * Central Axios instance + typed API helpers for the Flask backend.
 * All paths are relative so Vite's proxy routes them to http://localhost:5000.
 */

import axios from "axios";

const http = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

// ── Problems ──────────────────────────────────────────────────────────────────

/** Fetch all problems sorted by next_review */
export const getProblems = () =>
  http.get("/problems").then((r) => r.data);

/** Active problems due today or overdue */
export const getDueToday = () =>
  http.get("/problems/today").then((r) => r.data);

/** Active problems scheduled after today */
export const getUpcoming = () =>
  http.get("/problems/upcoming").then((r) => r.data);

/**
 * Add a new problem.
 * @param {{ title, topic, difficulty, date_solved, confidence, custom_days? }} data
 */
export const addProblem = (data) =>
  http.post("/problems", data).then((r) => r.data);

/**
 * Update any field(s) on a problem. Triggers rescheduling.
 * @param {number} id
 * @param {object} data
 */
export const updateProblem = (id, data) =>
  http.put(`/problems/${id}`, data).then((r) => r.data);

/**
 * Toggle is_done on a problem (mark done ↔ reactivate).
 * @param {number} id
 */
export const toggleDone = (id) =>
  http.patch(`/problems/${id}/done`).then((r) => r.data);

/**
 * Permanently delete a problem.
 * @param {number} id
 */
export const deleteProblem = (id) =>
  http.delete(`/problems/${id}`).then((r) => r.data);

// ── Analytics ─────────────────────────────────────────────────────────────────

/** Headline stats: total, active, due_today, avg_confidence */
export const getSummary = () =>
  http.get("/analytics/summary").then((r) => r.data);

/** { current_streak, longest_streak, total_active_days } */
export const getStreak = () =>
  http.get("/analytics/streak").then((r) => r.data);

/** Array of { date, count } for the last 30 days */
export const getProblemsOverTime = () =>
  http.get("/analytics/problems-over-time").then((r) => r.data);

/** Array of { topic, avg_confidence, problem_count, active_count } */
export const getWeakTopics = () =>
  http.get("/analytics/weak-topics").then((r) => r.data);
