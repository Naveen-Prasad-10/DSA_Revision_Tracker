import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../services/api";

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicProfile(id)
      .then(data => setProfile(data))
      .catch(err => setError(err.response?.data?.error || "Error loading profile"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wide" style={{padding: "2rem"}}>Loading profile...</div>;
  if (error) return <div className="page-wide" style={{padding: "2rem", color: "var(--danger)"}}>{error}</div>;
  if (!profile) return null;

  return (
    <div className="page-wide" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/friends" className="p-btn-rem" style={{ padding: "0.5rem 1rem", textDecoration: "none" }}>&larr; Back</Link>
        <h2 style={{ margin: 0 }}>{profile.username}'s Profile</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent-teal)" }}>{profile.current_streak}</div>
          <div style={{ color: "var(--text-sec)" }}>Current Streak (Days)</div>
        </div>
        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent-purple)" }}>{profile.total_solved}</div>
          <div style={{ color: "var(--text-sec)" }}>Problems Solved</div>
        </div>
        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent-orange)" }}>{profile.roadmap_count}</div>
          <div style={{ color: "var(--text-sec)" }}>Roadmap Items Done</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", background: "var(--surface)", padding: "1.5rem", borderRadius: "12px" }}>
          <h3>Difficulty Breakdown</h3>
          <ul style={{ marginTop: "1rem", listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="p-badge Easy">Easy</span>
              <strong>{profile.difficulties.Easy || 0}</strong>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="p-badge Medium">Medium</span>
              <strong>{profile.difficulties.Medium || 0}</strong>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="p-badge Hard">Hard</span>
              <strong>{profile.difficulties.Hard || 0}</strong>
            </li>
          </ul>
        </div>

        <div style={{ flex: "2 1 400px", background: "var(--surface)", padding: "1.5rem", borderRadius: "12px" }}>
          <h3>Recently Solved</h3>
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {profile.recent_problems.length === 0 && <p style={{ color: "var(--text-sec)" }}>No problems solved yet.</p>}
            {profile.recent_problems.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--surface-light)", borderRadius: "8px" }}>
                <span>{p.title}</span>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span className={`p-badge ${p.difficulty}`}>{p.difficulty}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-sec)" }}>{p.date_solved}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
