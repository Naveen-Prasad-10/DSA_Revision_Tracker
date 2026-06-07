import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const links = [
  { to: "/",          label: "🧠 Tracker"   },
  { to: "/problems",  label: "📋 Problems"  },
  { to: "/dashboard", label: "📊 Dashboard" },
  { to: "/roadmap",   label: "🗺️ Roadmap"   },
  { to: "/friends",   label: "👥 Friends"   },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-icon">⚡</span>
          <div>
            <div className="navbar-title">Code Review</div>
            <div className="navbar-sub">Spaced Repetition Tracker</div>
          </div>
        </div>
        <nav className="navbar-links" style={{ flexGrow: 1, display: "flex" }}>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {user && links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  ["nav-link", isActive ? "nav-link--active" : ""].join(" ").trim()
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          
          <div style={{ marginLeft: "auto", display: "flex", gap: "1rem", alignItems: "center" }}>
            {user ? (
              <>
                <span style={{ color: "var(--text-sec)", fontSize: "0.9rem" }}>
                  Hello, <strong>{user.username}</strong>
                </span>
                <button onClick={handleLogout} className="p-btn-rem" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "var(--surface-light)", color: "var(--text)" }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">Login</NavLink>
                <NavLink to="/register" className="p-btn-rem" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", textDecoration: "none" }}>Register</NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
