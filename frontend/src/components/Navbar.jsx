import { NavLink } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/",          label: "🧠 Tracker"   },
  { to: "/problems",  label: "📋 Problems"  },
  { to: "/dashboard", label: "📊 Dashboard" },
  { to: "/roadmap",   label: "🗺️ Roadmap"   },
];

export default function Navbar() {
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
        <nav className="navbar-links">
          {links.map(({ to, label }) => (
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
        </nav>
      </div>
    </header>
  );
}
