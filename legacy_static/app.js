/**
 * app.js — Frontend logic for the Spaced Repetition Coding Tracker.
 *
 * Responsibilities:
 *  - Fetch and render "due today", "upcoming", and "completed" problem lists
 *  - Handle the "Add Problem" form (including custom_days)
 *  - Revision modal — quick confidence + custom days update
 *  - Edit modal     — full problem edit (all fields)
 *  - Mark as done (✓) / reactivate (↩) / delete (🗑️) per card
 *  - Live schedule preview that reacts to confidence & custom days inputs
 */

// ── Scheduling mirror (matches utils.py) ────────────────────────────────────
const CONFIDENCE_INTERVALS = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 };

function computeDays(conf, custom) {
  if (custom && custom > 0) return custom;
  return CONFIDENCE_INTERVALS[conf] || 1;
}

function nextReviewLabel(days) {
  return days === 1 ? "tomorrow" : `in <strong>${days} days</strong>`;
}

// ── Confidence button factory ────────────────────────────────────────────────
function setupConfGroup(groupId, defaultVal, onChange) {
  const container = document.getElementById(groupId);
  let selected = defaultVal;

  container.querySelectorAll(".conf-btn").forEach(btn => {
    const v = parseInt(btn.dataset.val);
    btn.classList.toggle("active", v === defaultVal);
    btn.addEventListener("click", () => {
      container.querySelectorAll(".conf-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selected = v;
      if (onChange) onChange(selected);
    });
  });

  const setSelected = (v) => {
    selected = v;
    container.querySelectorAll(".conf-btn").forEach(b => {
      b.classList.toggle("active", parseInt(b.dataset.val) === v);
    });
    if (onChange) onChange(v);
  };

  return { get: () => selected, set: setSelected };
}

// ── Wire up ADD form ─────────────────────────────────────────────────────────
const addConf = setupConfGroup("conf-add", 3, () => updateAddPreview());
const addCustomInput = document.getElementById("custom_days_add");
function updateAddPreview() {
  const custom = parseInt(addCustomInput.value) || null;
  document.getElementById("schedule-preview").innerHTML =
    `📅 Next review ${nextReviewLabel(computeDays(addConf.get(), custom))}`;
}
addCustomInput.addEventListener("input", updateAddPreview);
document.getElementById("clear-add-days").addEventListener("click", () => {
  addCustomInput.value = ""; updateAddPreview();
});
updateAddPreview();

// ── Wire up REVISION modal ───────────────────────────────────────────────────
const reviseConf = setupConfGroup("conf-modal", 3, () => updateRevisePreview());
const reviseCustomInput = document.getElementById("custom_days_revise");
function updateRevisePreview() {
  const custom = parseInt(reviseCustomInput.value) || null;
  document.getElementById("modal-preview").innerHTML =
    `📅 Next review ${nextReviewLabel(computeDays(reviseConf.get(), custom))}`;
}
reviseCustomInput.addEventListener("input", updateRevisePreview);
document.getElementById("clear-revise-days").addEventListener("click", () => {
  reviseCustomInput.value = ""; updateRevisePreview();
});

// ── Wire up EDIT modal ───────────────────────────────────────────────────────
const editConf = setupConfGroup("conf-edit", 3, () => updateEditPreview());
const editCustomInput = document.getElementById("edit-custom-days");
function updateEditPreview() {
  const custom = parseInt(editCustomInput.value) || null;
  document.getElementById("edit-preview").innerHTML =
    `📅 Next review ${nextReviewLabel(computeDays(editConf.get(), custom))}`;
}
editCustomInput.addEventListener("input", updateEditPreview);
document.getElementById("clear-edit-days").addEventListener("click", () => {
  editCustomInput.value = ""; updateEditPreview();
});

// ── Default date_solved to today ─────────────────────────────────────────────
document.getElementById("date_solved").valueAsDate = new Date();

// ── API helpers ──────────────────────────────────────────────────────────────
async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}
async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json() };
}
async function apiPut(url, body) {
  const res = await fetch(url, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json() };
}
async function apiPatch(url) {
  const res = await fetch(url, { method: "PATCH" });
  return { ok: res.ok, data: await res.json() };
}
async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE" });
  return { ok: res.ok, data: await res.json() };
}

// ── Rendering helpers ────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function difficultyBadge(d) {
  return `<span class="badge badge-${d}">${d}</span>`;
}

/**
 * Build a single problem card element.
 * @param {object}  p         - problem row from API
 * @param {"active"|"done"}  mode - controls which action buttons appear
 */
function buildProblemCard(p, mode = "active") {
  const card = document.createElement("div");
  card.className = `problem-card${p.is_done ? " card-done" : ""}`;
  card.dataset.id = p.id;

  const intervalTag = p.custom_days
    ? `<span class="badge badge-custom" title="Custom interval">⚡ ${p.custom_days}d</span>`
    : "";

  // Action buttons vary by mode
  let actions = "";
  if (mode === "active") {
    // Due today: show Revise + Edit + Done + Delete
    // Upcoming: show Edit + Done + Delete (no Revise)
    const reviseBtn = !p.is_done
      ? `<button class="btn-revise" onclick="openRevisionModal(${p.id},'${escHtml(p.title)}',${p.confidence},${p.custom_days || 0})">Revise</button>`
      : "";
    actions = `
      ${reviseBtn}
      <button class="btn-edit"   onclick="openEditModal(${p.id})"   title="Edit">✏️</button>
      <button class="btn-done"   onclick="toggleDone(${p.id})"     title="Mark as done">✓</button>
      <button class="btn-delete" onclick="deleteProblem(${p.id})"   title="Delete">🗑️</button>
    `;
  } else {
    // Completed section: show Reactivate + Delete
    actions = `
      <button class="btn-reactivate" onclick="toggleDone(${p.id})" title="Reactivate">↩ Reactivate</button>
      <button class="btn-delete"     onclick="deleteProblem(${p.id})" title="Delete">🗑️</button>
    `;
  }

  card.innerHTML = `
    <div class="problem-info">
      <div class="problem-title">${escHtml(p.title)}</div>
      <div class="problem-meta">
        ${difficultyBadge(p.difficulty)}
        ${intervalTag}
        <span class="problem-topic" title="${escHtml(p.topic)}">${escHtml(p.topic)}</span>
        <span class="problem-date">📅 ${p.next_review}</span>
      </div>
    </div>
    <div class="card-actions">${actions}</div>
  `;
  return card;
}

// ── Render helpers ───────────────────────────────────────────────────────────
function renderList(containerId, problems, mode = "active", emptyMsg = "") {
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  if (!problems.length) {
    el.innerHTML = `<p class="empty-state">${emptyMsg}</p>`;
    return;
  }
  problems.forEach(p => el.appendChild(buildProblemCard(p, mode)));
}

// ── Completed section toggle ─────────────────────────────────────────────────
let completedVisible = false;

function toggleCompleted() {
  completedVisible = !completedVisible;
  const list = document.getElementById("completed-list");
  const btn  = document.getElementById("toggle-completed-btn");
  list.classList.toggle("hidden-list", !completedVisible);
  btn.textContent = completedVisible ? "Hide" : "Show";
}

// ── Load all dashboard data ──────────────────────────────────────────────────
async function loadAll() {
  try {
    const [dueProblems, upcomingProblems, allProblems] = await Promise.all([
      apiGet("/problems/today"),
      apiGet("/problems/upcoming"),
      apiGet("/problems"),
    ]);

    const doneProblems   = allProblems.filter(p => p.is_done);
    const activeProblems = allProblems.filter(p => !p.is_done);

    renderList("due-list",       dueProblems,      "active", "🎉 Nothing due today!");
    renderList("upcoming-list",  upcomingProblems, "active", "No upcoming problems yet.");
    renderList("completed-list", doneProblems,     "done",   "No completed problems yet.");

    document.getElementById("due-count").textContent   = dueProblems.length;
    document.getElementById("total-count").textContent = activeProblems.length;

    // Update Completed section toggle button label
    const btn = document.getElementById("toggle-completed-btn");
    btn.textContent = completedVisible ? "Hide" : `Show (${doneProblems.length})`;

  } catch (err) {
    console.error("Failed to load problems:", err);
  }
}

// ── Add Problem form ─────────────────────────────────────────────────────────
document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("form-feedback");
  const btn      = document.getElementById("add-btn");
  const confidence  = addConf.get();
  const custom_days = parseInt(addCustomInput.value) || null;

  const payload = {
    title:       document.getElementById("title").value.trim(),
    topic:       document.getElementById("topic").value.trim(),
    difficulty:  document.getElementById("difficulty").value,
    date_solved: document.getElementById("date_solved").value,
    confidence,
    custom_days,
  };

  if (!payload.title || !payload.topic || !payload.date_solved) {
    feedback.textContent = "⚠️ Please fill in all required fields.";
    feedback.className   = "form-feedback error";
    return;
  }

  btn.disabled = true; btn.textContent = "Adding…";
  const { ok, data } = await apiPost("/problems", payload);
  btn.disabled = false; btn.textContent = "Add Problem";

  if (ok) {
    feedback.innerHTML = `✅ Added! Next review: <strong>${data.next_review}</strong>`;
    feedback.className = "form-feedback success";
    document.getElementById("add-form").reset();
    document.getElementById("date_solved").valueAsDate = new Date();
    addConf.set(3);
    addCustomInput.value = "";
    updateAddPreview();
    await loadAll();
  } else {
    feedback.textContent = `❌ ${data.error || "Something went wrong."}`;
    feedback.className   = "form-feedback error";
  }
  setTimeout(() => { feedback.textContent = ""; feedback.className = "form-feedback"; }, 4000);
});

// ── Mark as Done / Reactivate ────────────────────────────────────────────────
async function toggleDone(id) {
  const { ok, data } = await apiPatch(`/problems/${id}/done`);
  if (ok) {
    await loadAll();
  } else {
    alert(`Error: ${data.error || "Failed to update"}`);
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────
async function deleteProblem(id) {
  // Find problem title for friendly confirmation
  const card  = document.querySelector(`.problem-card[data-id="${id}"]`);
  const title = card ? card.querySelector(".problem-title")?.textContent : `#${id}`;

  if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;

  const { ok, data } = await apiDelete(`/problems/${id}`);
  if (ok) {
    // Animate card out
    if (card) {
      card.classList.add("card-removing");
      card.addEventListener("animationend", () => card.remove(), { once: true });
    }
    await loadAll();
  } else {
    alert(`Error: ${data.error || "Delete failed"}`);
  }
}

// ── Revision Modal ───────────────────────────────────────────────────────────
let activeRevisionId = null;

function openRevisionModal(id, title, currentConf, currentCustomDays) {
  activeRevisionId = id;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-sub").textContent   =
    `Current confidence: ${currentConf}/5. How well do you remember it now?`;
  reviseConf.set(currentConf);
  reviseCustomInput.value = currentCustomDays || "";
  updateRevisePreview();
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal(which) {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("edit-overlay").classList.add("hidden");
  activeRevisionId = null;
  activeEditId     = null;
}

document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById("edit-overlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

document.getElementById("modal-save-btn").addEventListener("click", async () => {
  if (!activeRevisionId) return;
  const confidence  = reviseConf.get();
  const custom_days = parseInt(reviseCustomInput.value) || null;
  const { ok, data } = await apiPut(`/problems/${activeRevisionId}`, { confidence, custom_days });
  if (ok) { closeModal(); await loadAll(); }
  else alert(`Error: ${data.error || "Update failed"}`);
});

// ── Edit Modal ───────────────────────────────────────────────────────────────
let activeEditId = null;
let allProblemsCache = [];

async function openEditModal(id) {
  try {
    allProblemsCache = await apiGet("/problems");
  } catch { /* use existing cache */ }

  const p = allProblemsCache.find(x => x.id === id);
  if (!p) { alert("Problem not found."); return; }

  activeEditId = id;
  document.getElementById("edit-sub").textContent       = `ID #${id}`;
  document.getElementById("edit-title").value           = p.title;
  document.getElementById("edit-topic").value           = p.topic;
  document.getElementById("edit-difficulty").value      = p.difficulty;
  document.getElementById("edit-date-solved").value     = p.date_solved;
  document.getElementById("edit-custom-days").value     = p.custom_days || "";
  editConf.set(p.confidence);
  updateEditPreview();
  document.getElementById("edit-overlay").classList.remove("hidden");
}

document.getElementById("edit-save-btn").addEventListener("click", async () => {
  if (!activeEditId) return;
  const payload = {
    title:       document.getElementById("edit-title").value.trim(),
    topic:       document.getElementById("edit-topic").value.trim(),
    difficulty:  document.getElementById("edit-difficulty").value,
    date_solved: document.getElementById("edit-date-solved").value,
    confidence:  editConf.get(),
    custom_days: parseInt(document.getElementById("edit-custom-days").value) || 0,
  };
  const { ok, data } = await apiPut(`/problems/${activeEditId}`, payload);
  if (ok) { closeModal(); await loadAll(); }
  else alert(`Error: ${data.error || "Save failed"}`);
});

// ── Init ─────────────────────────────────────────────────────────────────────
loadAll();
