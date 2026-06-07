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

// ── Auth ──────────────────────────────────────────────────────────────────────

export const register = (data) =>
  http.post("/auth/register", data).then((r) => r.data);

export const login = (data) =>
  http.post("/auth/login", data).then((r) => r.data);

export const logout = () =>
  http.post("/auth/logout").then((r) => r.data);

export const getMe = () =>
  http.get("/auth/me").then((r) => r.data);

// ── Roadmap Progress ──────────────────────────────────────────────────────────

export const getRoadmapProgress = () =>
  http.get("/roadmap/progress").then((r) => r.data);

export const toggleRoadmapProgress = (problem_id) =>
  http.post("/roadmap/progress/toggle", { problem_id }).then((r) => r.data);

export const syncRoadmapProgress = (completed_ids) =>
  http.post("/roadmap/progress/sync", { completed_ids }).then((r) => r.data);

// ── Social / Friends ──────────────────────────────────────────────────────────

export const searchUsers = (query) =>
  http.get(`/social/search?q=${encodeURIComponent(query)}`).then((r) => r.data);

export const sendFriendRequest = (id) =>
  http.post(`/social/request/${id}`).then((r) => r.data);

export const acceptFriendRequest = (id) =>
  http.post(`/social/accept/${id}`).then((r) => r.data);

export const removeFriend = (id) =>
  http.delete(`/social/friend/${id}`).then((r) => r.data);

export const getFriends = () =>
  http.get("/social/friends").then((r) => r.data);

export const getPublicProfile = (id) =>
  http.get(`/social/profile/${id}`).then((r) => r.data);

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
