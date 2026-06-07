"""
app.py - Entry point for the Spaced Repetition Coding Tracker Flask app.
Initializes the app, database, and registers all blueprints.
"""

from flask import Flask
from models import init_db
from routes import problems_bp
from analytics import analytics_bp
from auth import auth_bp
from roadmap import roadmap_bp
from social import social_bp
import os

app = Flask(__name__, static_folder="frontend/dist", static_url_path="/")
app.secret_key = os.environ.get("SECRET_KEY", "coding-tracker-super-secret-key-123")

# Initialize database on startup
init_db()
# ── Blueprints ────────────────────────────────────────────────────────────────
app.register_blueprint(problems_bp)           # /problems/*
app.register_blueprint(analytics_bp)          # /analytics/*
app.register_blueprint(auth_bp)               # /auth/*
app.register_blueprint(roadmap_bp)            # /roadmap/*
app.register_blueprint(social_bp)             # /social/*

# ── Page routes (Catch-all for React Router) ──────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    """Serve React app's index.html for all non-API 404 errors."""
    return app.send_static_file("index.html")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    """Main entry point for the React application."""
    # If the path points to an actual file in 'dist', Flask serves it automatically
    # due to static_url_path='/'. This route handles the rest (client-side routing).
    return app.send_static_file("index.html")


if __name__ == "__main__":
    print("✅ Database initialized. Starting server at http://127.0.0.1:5000")
    app.run(debug=True)
