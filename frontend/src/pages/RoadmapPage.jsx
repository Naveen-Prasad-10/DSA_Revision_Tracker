import { useState, useEffect, useMemo } from "react";
import { ROADMAP } from "../data/roadmapData";
import { addProblem } from "../services/api";
import "./RoadmapPage.css";

// ── Helpers ──────────────────────────────────────────────────────────────────
const toSlug = (name) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
const leetcodeUrl = (name) => `https://leetcode.com/problems/${toSlug(name)}/`;

const STORAGE_KEY_COMPLETED = "roadmap_completed";
const STORAGE_KEY_CUSTOM = "roadmap_custom_problems";

export default function RoadmapPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [completed, setCompleted] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLETED) || "[]"));
    } catch { return new Set(); }
  });

  const [customProblems, setCustomProblems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM) || "{}");
    } catch { return {}; }
  });

  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "new" | "revision"
  const [openWeeks, setOpenWeeks] = useState(new Set([1])); // Week 1 open by default
  const [modalData, setModalData] = useState(null); // { weekNum, type }

  // ── Sync with localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify([...completed]));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customProblems));
  }, [customProblems]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleWeek = (weekNum) => {
    setOpenWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  const toggleProblem = (weekNum, type, id) => {
    const key = `w${weekNum}-${type}-${id}`;
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAddCustom = (weekNum, type, problem) => {
    const key = `w${weekNum}-${type}`;
    setCustomProblems(prev => {
      const list = prev[key] || [];
      if (list.some(p => String(p.id) === String(problem.id))) return prev;
      return { ...prev, [key]: [...list, problem] };
    });
  };

  const removeCustom = (weekNum, type, id) => {
    const key = `w${weekNum}-${type}`;
    const compKey = `w${weekNum}-${type}-${id}`;
    setCustomProblems(prev => {
      const list = prev[key] || [];
      return { ...prev, [key]: list.filter(p => String(p.id) !== String(id)) };
    });
    setCompleted(prev => {
      const next = new Set(prev);
      next.delete(compKey);
      return next;
    });
  };

  const addToReminders = async (problem, type) => {
    const difficulty = type === "revision" ? "Easy" : "Medium";
    try {
      await addProblem({
        title: `#${problem.id} ${problem.name}`,
        topic: "DSA Roadmap",
        difficulty,
        date_solved: new Date().toISOString().slice(0, 10),
        confidence: 3
      });
      alert(`✅ "${problem.name}" added to reminders`);
    } catch (err) {
      alert("❌ Failed to add problem");
    }
  };

  // ── Progress Calculations ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    let total = 0;
    let done = 0;
    const weekStats = ROADMAP.map(week => {
      const newProbs = [...week.new, ...(customProblems[`w${week.week}-new`] || [])];
      const revProbs = [...week.revision, ...(customProblems[`w${week.week}-revision`] || [])];
      
      const weekTotal = newProbs.length + revProbs.length;
      const weekDone = 
        newProbs.filter(p => completed.has(`w${week.week}-new-${p.id}`)).length +
        revProbs.filter(p => completed.has(`w${week.week}-revision-${p.id}`)).length;
      
      total += weekTotal;
      done += weekDone;
      
      return { weekNum: week.week, total: weekTotal, done: weekDone, pct: weekTotal ? Math.round((weekDone/weekTotal)*100) : 0 };
    });
    return { total, done, pct: total ? Math.round((done/total)*100) : 0, weekStats };
  }, [customProblems, completed]);

  return (
    <div className="page-wide roadmap-page">
      {/* ── Global Header ─────────────────────────────────── */}
      <div className="roadmap-header">
        <div className="roadmap-header-content">
          <h1>8-Week DSA Roadmap</h1>
          <p className="roadmap-sub">A structured guide to mastering Data Structures and Algorithms.</p>
        </div>
        
        <div className="overall-stats-card">
          <div className="overall-stats-labels">
            <span>Overall Progress</span>
            <span>{stats.done} / {stats.total}</span>
          </div>
          <div className="overall-bar-wrap">
            <div className="overall-bar-fill" style={{ width: `${stats.pct}%` }} />
          </div>
          <span className="overall-pct">{stats.pct}% Complete</span>
        </div>
      </div>

      {/* ── Rules Banner ─────────────────────────────────── */}
      <div className="rules-banner">
        <div className="rule-item"><strong>12-15</strong> Probs/Week</div>
        <div className="rule-item"><strong>8-9</strong> New</div>
        <div className="rule-item"><strong>4-6</strong> Revision</div>
        <div className="rule-item"><strong>70/30</strong> Easy/Med</div>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="roadmap-filters">
        {["all", "new", "revision"].map(f => (
          <button 
            key={f}
            className={`filter-btn ${activeFilter === f ? "active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} Problems
          </button>
        ))}
      </div>

      {/* ── Week List ────────────────────────────────────────── */}
      <div className="week-accordion">
        {ROADMAP.map(week => {
          const weekStat = stats.weekStats.find(s => s.weekNum === week.week);
          const isOpen = openWeeks.has(week.week);
          
          const newProblems = [...week.new, ...(customProblems[`w${week.week}-new`] || [])]
            .map(p => ({ ...p, type: 'new' }));
          const revProblems = [...week.revision, ...(customProblems[`w${week.week}-revision`] || [])]
            .map(p => ({ ...p, type: 'revision' }));

          return (
            <div key={week.week} className={`week-card ${isOpen ? "open" : ""}`}>
              <div className="week-header" onClick={() => toggleWeek(week.week)}>
                <div className="week-header-left">
                  <span className="week-badge">Week {week.week}</span>
                  <span className="week-title">{week.topic}</span>
                </div>
                <div className="week-header-right">
                  <div className="week-prog-pill">
                    <div className="week-prog-bar">
                      <div className="week-prog-fill" style={{ width: `${weekStat.pct}%` }} />
                    </div>
                    <span>{weekStat.done}/{weekStat.total}</span>
                  </div>
                  <span className="chevron"></span>
                </div>
              </div>

              {isOpen && (
                <div className="week-body">
                  <div className="week-body-inner">
                    {/* New Problems */}
                    {(activeFilter === "all" || activeFilter === "new") && (
                      <div className="prob-section">
                        <div className="prob-section-title new-title">
                          <span className="dot"></span> 🆕 New Problems ({newProblems.length})
                        </div>
                        <div className="prob-list">
                          {newProblems.map(p => (
                            <ProblemRow 
                              key={p.id} 
                              week={week.week} 
                              p={p} 
                              type="new" 
                              isDone={completed.has(`w${week.week}-new-${p.id}`)}
                              onToggle={() => toggleProblem(week.week, "new", p.id)}
                              onAddReminder={() => addToReminders(p, "new")}
                              onRemove={p.custom ? () => removeCustom(week.week, "new", p.id) : null}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="week-divider" />

                    {/* Revision */}
                    {(activeFilter === "all" || activeFilter === "revision") && (
                      <div className="prob-section">
                        <div className="prob-section-title rev-title">
                          <span className="dot"></span> 🔁 Revision ({revProblems.length})
                        </div>
                        <div className="prob-list">
                          {revProblems.map(p => (
                            <ProblemRow 
                              key={p.id} 
                              week={week.week} 
                              p={p} 
                              type="revision" 
                              isDone={completed.has(`w${week.week}-revision-${p.id}`)}
                              onToggle={() => toggleProblem(week.week, "revision", p.id)}
                              onAddReminder={() => addToReminders(p, "revision")}
                              onRemove={p.custom ? () => removeCustom(week.week, "revision", p.id) : null}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      className="btn-add-week"
                      onClick={() => setModalData({ weekNum: week.week, topic: week.topic })}
                    >
                      ＋ Add Problem to Week {week.week}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modal ────────────────────────────────────────── */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Add Problem — Week {modalData.weekNum}</h3>
            <p className="modal-sub">{modalData.topic}</p>
            
            <form onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const name = formData.get("name");
              const idStr = formData.get("id");
              const type = formData.get("type");
              
              if (!name) return;
              const problem = {
                id: idStr ? parseInt(idStr) : `custom_${Date.now()}`,
                name: name,
                custom: true
              };
              handleAddCustom(modalData.weekNum, type, problem);
              setModalData(null);
            }}>
              <div className="field">
                <label>Problem #</label>
                <input name="id" type="number" placeholder="e.g. 42" className="input" />
              </div>
              <div className="field">
                <label>Problem Name</label>
                <input name="name" type="text" placeholder="e.g. Trapping Rain Water" className="input" required />
              </div>
              <div className="field">
                <label>Section</label>
                <select name="type" className="select">
                  <option value="new">🆕 New Problems</option>
                  <option value="revision">🔁 Revision</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModalData(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{marginTop: 0}}>Add Problem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProblemRow({ week, p, type, isDone, onToggle, onAddReminder, onRemove }) {
  return (
    <div className={`p-row ${isDone ? "done" : ""}`}>
      <input type="checkbox" checked={isDone} onChange={onToggle} />
      <span className="p-id">{String(p.id).startsWith("custom_") ? "🔖" : `#${p.id}`}</span>
      <a href={leetcodeUrl(p.name)} target="_blank" rel="noreferrer" className="p-link">{p.name}</a>
      <div className="p-badges">
        <span className={`p-badge ${type}`}>{type}</span>
        {p.custom && <span className="p-badge custom">Custom</span>}
      </div>
      <div className="p-actions">
        <button className="p-btn-rem" onClick={onAddReminder}>+ Reminder</button>
        {onRemove && <button className="p-btn-del" onClick={onRemove}>✕</button>}
      </div>
    </div>
  );
}
