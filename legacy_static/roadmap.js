/**
 * roadmap.js — Logic for the 8-Week DSA Roadmap Dashboard
 *
 * Responsibilities:
 *  - Render roadmap weeks as collapsible accordion cards
 *  - Generate problem slugs + LeetCode URLs from names
 *  - Persist checkbox (completion) state in localStorage
 *  - Persist custom problems added by the user in localStorage
 *  - Filter view: All / New Only / Revision Only
 *  - Show per-week progress bars
 *  - Show overall completion progress
 *  - "Add Problem" modal per week (custom problems stored in localStorage)
 *  - "Add to Reminders" button → POST to existing /problems API
 */

// ── Storage keys ──────────────────────────────────────────────────────────────
const STORAGE_KEY_COMPLETED = "roadmap_completed";
const STORAGE_KEY_CUSTOM    = "roadmap_custom_problems"; // { "w1-new": [...], "w3-revision": [...] }

// ── Slug generator: "Two Sum" → "two-sum" ────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function leetcodeUrl(name) {
  return `https://leetcode.com/problems/${toSlug(name)}/`;
}

// ── Completion state (localStorage) ──────────────────────────────────────────
function loadCompleted() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLETED) || "[]"));
  } catch {
    return new Set();
  }
}

function saveCompleted(set) {
  localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify([...set]));
}

function problemKey(weekNum, type, id) {
  return `w${weekNum}-${type}-${id}`;
}

// ── Custom problems (localStorage) ───────────────────────────────────────────
function loadCustomProblems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM) || "{}");
  } catch {
    return {};
  }
}

function saveCustomProblems(data) {
  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(data));
}

/**
 * Returns the custom problems for a given week + type.
 * customProblems shape: { "w1-new": [{id, name}], "w2-revision": [{id, name}] }
 */
function getCustomList(weekNum, type) {
  const key = `w${weekNum}-${type}`;
  return customProblems[key] || [];
}

/**
 * Adds a new custom problem entry and persists.
 */
function addCustomProblem(weekNum, type, problem) {
  const key = `w${weekNum}-${type}`;
  if (!customProblems[key]) customProblems[key] = [];
  // Avoid exact duplicate ids in same week+type
  if (customProblems[key].some(p => String(p.id) === String(problem.id))) return false;
  customProblems[key].push(problem);
  saveCustomProblems(customProblems);
  return true;
}

/**
 * Removes a custom problem entry and persists.
 */
function removeCustomProblem(weekNum, type, id) {
  const key = `w${weekNum}-${type}`;
  if (!customProblems[key]) return;
  customProblems[key] = customProblems[key].filter(p => String(p.id) !== String(id));
  saveCustomProblems(customProblems);
}

// ── Global state ──────────────────────────────────────────────────────────────
let completed      = loadCompleted();
let customProblems = loadCustomProblems();
let activeFilter   = "all"; // "all" | "new" | "revision"

// ── Toast notification ────────────────────────────────────────────────────────
function showToast(msg, type = "default") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2900);
}

// ── "Add Problem to Week" Modal ───────────────────────────────────────────────
let addModal_weekNum = null;

function openAddProblemModal(weekNum, defaultType = "new") {
  addModal_weekNum = weekNum;

  // Populate week label
  const week = ROADMAP.find(w => w.week === weekNum);
  document.getElementById("add-prob-modal-title").textContent =
    `Add Problem — Week ${weekNum}: ${week ? week.topic : ""}`;

  // Reset fields
  document.getElementById("add-prob-id").value   = "";
  document.getElementById("add-prob-name").value = "";
  document.getElementById("add-prob-type").value = defaultType;
  document.getElementById("add-prob-error").textContent = "";

  // Show modal
  document.getElementById("add-prob-overlay").classList.remove("hidden");
  document.getElementById("add-prob-id").focus();
}

function closeAddProblemModal() {
  document.getElementById("add-prob-overlay").classList.add("hidden");
  addModal_weekNum = null;
}

document.getElementById("add-prob-overlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeAddProblemModal();
});

document.getElementById("add-prob-cancel").addEventListener("click", closeAddProblemModal);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeAddProblemModal();
  }
});

document.getElementById("add-prob-save").addEventListener("click", () => {
  const idRaw  = document.getElementById("add-prob-id").value.trim();
  const name   = document.getElementById("add-prob-name").value.trim();
  const type   = document.getElementById("add-prob-type").value;
  const errEl  = document.getElementById("add-prob-error");

  if (!name) {
    errEl.textContent = "⚠️ Problem name is required.";
    return;
  }

  // ID: auto-generate a negative unique ID if left blank (to distinguish from LeetCode IDs)
  const id = idRaw ? parseInt(idRaw) : ("custom_" + Date.now());

  const added = addCustomProblem(addModal_weekNum, type, { id, name, custom: true });
  if (!added) {
    errEl.textContent = `⚠️ Problem #${id} already exists in this week's ${type} list.`;
    return;
  }

  closeAddProblemModal();
  showToast(`✅ "${name}" added to Week ${addModal_weekNum} (${type})`, "success");

  // Re-render only the affected week card
  rerenderWeek(addModal_weekNum);
  updateOverallProgress();
});

// ── Full render ───────────────────────────────────────────────────────────────
function render() {
  const accordion = document.getElementById("week-accordion");
  accordion.innerHTML = "";
  ROADMAP.forEach(week => accordion.appendChild(buildWeekCard(week)));
  updateOverallProgress();
}

/**
 * Re-render a single week card in place (after adding a custom problem).
 */
function rerenderWeek(weekNum) {
  const oldCard = document.querySelector(`.week-card[data-week="${weekNum}"]`);
  if (!oldCard) return;

  const week    = ROADMAP.find(w => w.week === weekNum);
  if (!week) return;

  const wasOpen = oldCard.classList.contains("open");
  const newCard = buildWeekCard(week);
  if (wasOpen) {
    newCard.classList.add("open");
    newCard.querySelector(".week-header").setAttribute("aria-expanded", "true");
  }
  oldCard.replaceWith(newCard);

  // Re-apply current filter
  applyFilterToCard(newCard);
}

// ── Week card builder ─────────────────────────────────────────────────────────
function buildWeekCard(week) {
  // Merge base + custom problems
  const newProblems = [
    ...week.new,
    ...getCustomList(week.week, "new"),
  ];
  const revProblems = [
    ...week.revision,
    ...getCustomList(week.week, "revision"),
  ];

  const allProblems = [
    ...newProblems.map(p => ({ ...p, type: "new" })),
    ...revProblems.map(p => ({ ...p, type: "revision" })),
  ];

  const weekCompleted = allProblems.filter(p =>
    completed.has(problemKey(week.week, p.type, p.id))
  ).length;
  const weekTotal = allProblems.length;
  const pct = weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  const card = document.createElement("div");
  card.className = "week-card";
  card.dataset.week = week.week;

  // ── Header ────────────────────────────────────────────────────────────────
  const header = document.createElement("div");
  header.className = "week-header";
  header.setAttribute("role", "button");
  header.setAttribute("aria-expanded", "false");
  header.id = `week-header-${week.week}`;

  header.innerHTML = `
    <div class="week-header-left">
      <span class="week-badge">Week ${week.week}</span>
      <span class="week-title">${week.topic}</span>
    </div>
    <div class="week-header-right">
      <div class="progress-pill">
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="progress-text">${weekCompleted}/${weekTotal}</span>
      </div>
      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  `;

  // Stop clicks on the "Add Problem" button from toggling the accordion
  header.addEventListener("click", e => {
    if (!e.target.closest(".btn-add-week")) toggleWeek(card);
  });

  // ── Body ──────────────────────────────────────────────────────────────────
  const body = document.createElement("div");
  body.className = "week-body";
  body.id = `week-body-${week.week}`;

  const inner = document.createElement("div");
  inner.className = "week-body-inner";

  // New section
  inner.appendChild(buildProblemSection(week, newProblems, "new"));
  inner.appendChild(buildDivider());
  // Revision section
  inner.appendChild(buildProblemSection(week, revProblems, "revision"));
  inner.appendChild(buildDivider());

  // "Add Problem to this week" button (at the bottom of body)
  const addBtn = document.createElement("button");
  addBtn.className = "btn-add-week";
  addBtn.id = `add-week-${week.week}`;
  addBtn.innerHTML = `<span style="font-size:1rem">＋</span> Add Problem to Week ${week.week}`;
  addBtn.addEventListener("click", e => {
    e.stopPropagation();
    openAddProblemModal(week.week);
  });
  inner.appendChild(addBtn);

  body.appendChild(inner);

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function buildDivider() {
  const d = document.createElement("div");
  d.className = "week-divider";
  return d;
}

// ── Problem section builder ───────────────────────────────────────────────────
function buildProblemSection(week, problems, type) {
  const section = document.createElement("div");
  section.dataset.section = type;

  const labelMap = {
    new:      { label: "🆕 New Problems", cls: "new-title" },
    revision: { label: "🔁 Revision",     cls: "rev-title" },
  };
  const { label, cls } = labelMap[type];

  const titleRow = document.createElement("div");
  titleRow.style.cssText = "display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;";

  const titleEl = document.createElement("div");
  titleEl.className = `prob-section-title ${cls}`;
  titleEl.style.marginBottom = "0";
  titleEl.innerHTML = `<span class="dot"></span>${label} <span style="opacity:0.6;font-weight:400">(${problems.length})</span>`;

  titleRow.appendChild(titleEl);
  section.appendChild(titleRow);

  const list = document.createElement("div");
  list.className = "problem-list-roadmap";

  problems.forEach(p => list.appendChild(buildProblemRow(week.week, p, type)));
  section.appendChild(list);
  return section;
}

// ── Problem row builder ───────────────────────────────────────────────────────
function buildProblemRow(weekNum, problem, type) {
  const key    = problemKey(weekNum, type, problem.id);
  const isDone = completed.has(key);
  const isCustom = Boolean(problem.custom);

  const row = document.createElement("div");
  row.className = `problem-row${isDone ? " completed" : ""}`;
  row.dataset.key  = key;
  row.dataset.type = type;
  row.dataset.week = weekNum;

  // Apply current filter
  if (activeFilter !== "all" && activeFilter !== type) {
    row.classList.add("hidden-row");
  }

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type  = "checkbox";
  checkbox.className = "prob-checkbox";
  checkbox.checked   = isDone;
  checkbox.id = `chk-${key}`;
  checkbox.setAttribute("aria-label", `Mark ${problem.name} as completed`);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      completed.add(key);
      row.classList.add("completed");
    } else {
      completed.delete(key);
      row.classList.remove("completed");
    }
    saveCompleted(completed);
    updateWeekProgress(weekNum);
    updateOverallProgress();
  });

  // Problem number badge
  const numBadge = document.createElement("span");
  numBadge.className = "prob-num";
  numBadge.textContent = isCustom && String(problem.id).startsWith("custom_")
    ? "🔖" : `#${problem.id}`;

  // Problem name link
  const link = document.createElement("a");
  link.className = "prob-name";
  link.href      = leetcodeUrl(problem.name);
  link.target    = "_blank";
  link.rel       = "noopener noreferrer";
  link.textContent = problem.name;

  // Type badge
  const typeBadge = document.createElement("span");
  typeBadge.className = `type-badge ${type === "new" ? "new" : "rev"}`;
  typeBadge.textContent = type === "new" ? "New" : "Revision";

  // Custom badge (only for user-added problems)
  if (isCustom) {
    const custBadge = document.createElement("span");
    custBadge.className = "type-badge";
    custBadge.style.cssText = "background:rgba(251,191,36,0.12);color:#f59e0b;";
    custBadge.textContent = "Custom";
    row.appendChild(checkbox);
    row.appendChild(numBadge);
    row.appendChild(link);
    row.appendChild(typeBadge);
    row.appendChild(custBadge);
    row.appendChild(buildReminderBtn(problem, type));
    row.appendChild(buildDeleteBtn(weekNum, type, problem));
  } else {
    row.appendChild(checkbox);
    row.appendChild(numBadge);
    row.appendChild(link);
    row.appendChild(typeBadge);
    row.appendChild(buildReminderBtn(problem, type));
  }

  return row;
}

function buildReminderBtn(problem, type) {
  const btn = document.createElement("button");
  btn.className = "btn-add-reminder";
  btn.textContent = "+ Reminder";
  btn.title = "Add to spaced-repetition reminders";
  btn.addEventListener("click", () => addToReminders(problem, type, btn));
  return btn;
}

function buildDeleteBtn(weekNum, type, problem) {
  const btn = document.createElement("button");
  btn.className = "btn-delete-custom";
  btn.textContent = "✕";
  btn.title = "Remove this custom problem";
  btn.addEventListener("click", () => {
    if (!confirm(`Remove "${problem.name}" from Week ${weekNum}?`)) return;
    // Also clear its checkbox state
    completed.delete(problemKey(weekNum, type, problem.id));
    saveCompleted(completed);
    removeCustomProblem(weekNum, type, problem.id);
    rerenderWeek(weekNum);
    updateOverallProgress();
    showToast(`"${problem.name}" removed`, "default");
  });
  return btn;
}

// ── Accordion toggle ──────────────────────────────────────────────────────────
function toggleWeek(card) {
  const isOpen = card.classList.contains("open");
  card.classList.toggle("open", !isOpen);
  card.querySelector(".week-header").setAttribute("aria-expanded", String(!isOpen));
}

// ── Per-week progress update ──────────────────────────────────────────────────
function updateWeekProgress(weekNum) {
  const week = ROADMAP.find(w => w.week === weekNum);
  if (!week) return;

  const allProblems = [
    ...week.new.map(p => ({ ...p, type: "new" })),
    ...getCustomList(weekNum, "new").map(p => ({ ...p, type: "new" })),
    ...week.revision.map(p => ({ ...p, type: "revision" })),
    ...getCustomList(weekNum, "revision").map(p => ({ ...p, type: "revision" })),
  ];

  const doneCount = allProblems.filter(p =>
    completed.has(problemKey(weekNum, p.type, p.id))
  ).length;
  const total = allProblems.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const card = document.querySelector(`.week-card[data-week="${weekNum}"]`);
  if (!card) return;
  const fill = card.querySelector(".progress-bar-fill");
  const text = card.querySelector(".progress-text");
  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${doneCount}/${total}`;
}

// ── Overall progress update ───────────────────────────────────────────────────
function updateOverallProgress() {
  let total = 0, done = 0;

  ROADMAP.forEach(week => {
    const allProblems = [
      ...week.new.map(p => ({ ...p, type: "new" })),
      ...getCustomList(week.week, "new").map(p => ({ ...p, type: "new" })),
      ...week.revision.map(p => ({ ...p, type: "revision" })),
      ...getCustomList(week.week, "revision").map(p => ({ ...p, type: "revision" })),
    ];
    allProblems.forEach(p => {
      total++;
      if (completed.has(problemKey(week.week, p.type, p.id))) done++;
    });
  });

  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("overall-fill").style.width = `${pct}%`;
  document.getElementById("overall-pct").textContent  = `${pct}%`;
  document.getElementById("overall-label").textContent =
    `Overall Progress — ${done} / ${total} problems`;
}

// ── Filter logic ──────────────────────────────────────────────────────────────
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.filter === filter)
  );
  document.querySelectorAll(".problem-row").forEach(row => {
    const type = row.dataset.type;
    row.classList.toggle("hidden-row", filter !== "all" && filter !== type);
  });
}

function applyFilterToCard(card) {
  card.querySelectorAll(".problem-row").forEach(row => {
    const type = row.dataset.type;
    row.classList.toggle("hidden-row", activeFilter !== "all" && activeFilter !== type);
  });
}

// ── Add to Reminders (existing /problems API) ─────────────────────────────────
async function addToReminders(problem, type, btn) {
  if (btn.classList.contains("added")) return;
  const difficulty = type === "revision" ? "Easy" : "Medium";
  const today = new Date().toISOString().slice(0, 10);
  const payload = {
    title:       `#${problem.id} ${problem.name}`,
    topic:       "DSA Roadmap",
    difficulty,
    date_solved: today,
    confidence:  3,
    custom_days: null,
  };
  try {
    const res  = await fetch("/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      btn.textContent = "✓ Added";
      btn.classList.add("added");
      showToast(`✅ "${problem.name}" added to reminders`, "success");
    } else {
      showToast(`❌ ${data.error || "Failed to add"}`, "error");
    }
  } catch {
    showToast("❌ Network error. Is the server running?", "error");
  }
}

// ── Wire up filter buttons ────────────────────────────────────────────────────
document.querySelectorAll(".filter-btn").forEach(btn =>
  btn.addEventListener("click", () => setFilter(btn.dataset.filter))
);

// ── Init ──────────────────────────────────────────────────────────────────────
render();
