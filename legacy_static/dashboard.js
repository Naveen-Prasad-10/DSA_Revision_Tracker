/**
 * dashboard.js — Analytics Dashboard Frontend Logic
 *
 * Fetches data from:
 *   GET /analytics/summary           → headline stat cards
 *   GET /analytics/streak            → streak banner
 *   GET /analytics/problems-over-time → line chart
 *   GET /analytics/weak-topics        → bar chart + topic table
 *
 * Uses Chart.js v4 (loaded from CDN in dashboard.html).
 * All Chart.js instances are stored so they can be destroyed & recreated on refresh.
 */

"use strict";

// ── Chart.js global defaults (match dark theme) ───────────────────────────────
Chart.defaults.color          = "#94a3b8";   // --text-muted
Chart.defaults.borderColor    = "rgba(255,255,255,0.06)";
Chart.defaults.font.family    = "Inter, system-ui, sans-serif";
Chart.defaults.font.size      = 12;
Chart.defaults.plugins.legend.display = false;

// ── Design tokens (mirror CSS variables) ─────────────────────────────────────
const CLR = {
  accent:      "#7c6dfa",
  accentGlow:  "rgba(124,109,250,0.18)",
  green:       "#34d399",
  greenGlow:   "rgba(52,211,153,0.15)",
  yellow:      "#fbbf24",
  red:         "#f87171",
  surface2:    "#22263a",
  border:      "rgba(255,255,255,0.08)",
  textMuted:   "#94a3b8",
};

// ── Gradient helpers ──────────────────────────────────────────────────────────
function makeGradient(ctx, colorTop, colorBot) {
  const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  grad.addColorStop(0, colorTop);
  grad.addColorStop(1, colorBot);
  return grad;
}

// ── API fetch helper ──────────────────────────────────────────────────────────
async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

// ── Chart instance registry (so we destroy before re-creating) ───────────────
const charts = {};

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Summary stat cards
// ─────────────────────────────────────────────────────────────────────────────
async function loadSummary() {
  try {
    const d = await apiGet("/analytics/summary");
    document.getElementById("stat-total").textContent = d.total_problems;
    document.getElementById("stat-active").textContent = d.active;
    document.getElementById("stat-due").textContent    = d.due_today;
    document.getElementById("stat-conf").textContent   =
      d.avg_confidence ? d.avg_confidence.toFixed(1) : "—";
  } catch (err) {
    console.error("Summary fetch failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Streak banner
// ─────────────────────────────────────────────────────────────────────────────
function streakMessage(current, longest) {
  if (current === 0) return ["Start today!", "No active streak yet"];
  if (current === 1) return ["Just started 🚀", "Keep it going!"];
  if (current >= longest && longest > 1) return ["Personal best! 🏆", `${current} days straight`];
  if (current >= 7)  return ["On a roll! 🔥", `${longest - current} days to beat your best`];
  if (current >= 3)  return ["Building momentum 💪", `${longest - current} days to beat your best`];
  return [`${current} day streak`, `Best: ${longest} days`];
}

async function loadStreak() {
  try {
    const d = await apiGet("/analytics/streak");
    document.getElementById("streak-current").textContent = d.current_streak;
    document.getElementById("streak-longest").textContent = d.longest_streak;
    document.getElementById("streak-days").textContent    = d.total_active_days;

    const [msg, sub] = streakMessage(d.current_streak, d.longest_streak);
    document.getElementById("streak-msg").textContent = msg;
    document.getElementById("streak-sub").textContent = sub;

    // Flame emoji dims if streak is cold
    if (d.current_streak === 0) {
      document.querySelector(".streak-flame").style.filter = "grayscale(1) opacity(0.4)";
    }
  } catch (err) {
    console.error("Streak fetch failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Problems Over Time (line chart)
// ─────────────────────────────────────────────────────────────────────────────
async function loadOverTime() {
  try {
    const data = await apiGet("/analytics/problems-over-time");

    // Format labels: show "Mar 28" style
    const labels = data.map(d => {
      const [, m, day] = d.date.split("-");
      const monthName = ["Jan","Feb","Mar","Apr","May","Jun",
                         "Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1];
      return `${monthName} ${parseInt(day)}`;
    });
    const values = data.map(d => d.count);

    const canvas = document.getElementById("chart-over-time");
    const ctx    = canvas.getContext("2d");

    destroyChart("overTime");
    charts.overTime = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          data:            values,
          borderColor:     CLR.accent,
          backgroundColor: makeGradient(ctx, CLR.accentGlow, "rgba(124,109,250,0)"),
          borderWidth:     2,
          pointRadius:     values.map(v => v > 0 ? 4 : 0),
          pointHoverRadius: 6,
          pointBackgroundColor: CLR.accent,
          pointBorderColor: "transparent",
          fill:            true,
          tension:         0.4,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: {
            grid:   { color: CLR.border },
            ticks:  {
              color:      CLR.textMuted,
              maxTicksLimit: 8,
              maxRotation: 0,
            },
          },
          y: {
            grid:       { color: CLR.border },
            ticks:      { color: CLR.textMuted, stepSize: 1, precision: 0 },
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: "#1a1d27",
            borderColor:     CLR.accent,
            borderWidth:     1,
            titleColor:      "#e2e8f0",
            bodyColor:       CLR.textMuted,
            padding:         10,
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} problem${ctx.parsed.y !== 1 ? "s" : ""}`,
            },
          },
        },
      },
    });

    // Update "last updated" timestamp
    document.getElementById("time-updated").textContent =
      `Last refreshed: ${new Date().toLocaleTimeString()}`;

  } catch (err) {
    console.error("Over-time chart failed:", err);
    document.getElementById("chart-over-time").closest(".chart-card").innerHTML +=
      `<p class="dash-empty">⚠️ Could not load chart data.</p>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — Weak Topics (horizontal bar chart + mini table)
// ─────────────────────────────────────────────────────────────────────────────
function confClass(avg) {
  if (avg < 2.5) return "conf-low";
  if (avg < 3.5) return "conf-medium";
  return "conf-high";
}

function confLabel(avg) {
  if (avg < 2.5) return "Weak";
  if (avg < 3.5) return "Fair";
  return "Strong";
}

async function loadWeakTopics() {
  try {
    const data = await apiGet("/analytics/weak-topics");

    if (!data.length) {
      document.getElementById("chart-weak-topics").closest(".chart-card").innerHTML +=
        `<p class="dash-empty">Add some problems to see topic analysis.</p>`;
      return;
    }

    // Colour each bar by confidence level
    const barColors = data.map(d =>
      d.avg_confidence < 2.5 ? "rgba(248,113,113,0.75)"
      : d.avg_confidence < 3.5 ? "rgba(251,191,36,0.75)"
      : "rgba(52,211,153,0.75)"
    );
    const borderColors = data.map(d =>
      d.avg_confidence < 2.5 ? CLR.red
      : d.avg_confidence < 3.5 ? CLR.yellow
      : CLR.green
    );

    const canvas = document.getElementById("chart-weak-topics");
    const ctx    = canvas.getContext("2d");

    destroyChart("weakTopics");
    charts.weakTopics = new Chart(ctx, {
      type: "bar",
      data: {
        labels:   data.map(d => d.topic),
        datasets: [{
          data:            data.map(d => d.avg_confidence),
          backgroundColor: barColors,
          borderColor:     borderColors,
          borderWidth:     1.5,
          borderRadius:    5,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        indexAxis: "y",    // horizontal bars
        scales: {
          x: {
            grid:        { color: CLR.border },
            ticks:       { color: CLR.textMuted, stepSize: 1 },
            min:         0,
            max:         5,
            title: {
              display: true,
              text:    "Avg Confidence (1–5)",
              color:   CLR.textMuted,
              font:    { size: 11 },
            },
          },
          y: {
            grid:  { display: false },
            ticks: { color: "#e2e8f0", font: { size: 12, weight: "500" } },
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: "#1a1d27",
            borderColor:     CLR.border,
            borderWidth:     1,
            titleColor:      "#e2e8f0",
            bodyColor:       CLR.textMuted,
            padding:         10,
            callbacks: {
              label: ctx => [
                ` Avg confidence: ${ctx.parsed.x.toFixed(2)} / 5`,
                ` Problems: ${data[ctx.dataIndex].problem_count}`,
                ` Active:   ${data[ctx.dataIndex].active_count}`,
              ],
            },
          },
        },
      },
    });

    // Mini table below the chart
    const tableEl = document.getElementById("weak-topics-table");
    tableEl.innerHTML = data.map(d => `
      <div class="weak-topic-row">
        <span class="weak-topic-name" title="${d.topic}">${d.topic}</span>
        <span style="font-size:0.72rem; color:var(--text-muted);">${d.problem_count} problems</span>
        <span class="weak-topic-conf ${confClass(d.avg_confidence)}">
          ${confLabel(d.avg_confidence)} · ${d.avg_confidence}
        </span>
      </div>
    `).join("");

  } catch (err) {
    console.error("Weak topics chart failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Refresh orchestration
// ─────────────────────────────────────────────────────────────────────────────
async function loadAll() {
  const btn = document.getElementById("refresh-btn");
  btn.classList.add("spinning");
  btn.disabled = true;

  // Clear weak topics table so it doesn't double-render on refresh
  const tableEl = document.getElementById("weak-topics-table");
  if (tableEl) tableEl.innerHTML = "";

  await Promise.allSettled([
    loadSummary(),
    loadStreak(),
    loadOverTime(),
    loadWeakTopics(),
  ]);

  btn.classList.remove("spinning");
  btn.disabled = false;
}

// ── Refresh button ────────────────────────────────────────────────────────────
document.getElementById("refresh-btn").addEventListener("click", loadAll);

// ── Init ──────────────────────────────────────────────────────────────────────
loadAll();
