"""
models.py - Database initialization and helper functions.
Uses SQLite for lightweight, file-based persistence.
"""

import sqlite3
import os

# Path to the SQLite database file
DB_PATH = os.path.join(os.path.dirname(__file__), "tracker.db")


def get_db():
    """Open and return a SQLite connection with row_factory for dict-like rows."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Rows behave like dicts
    return conn


def init_db():
    """
    Create the 'problems' table if it doesn't exist, and run any
    migrations needed to upgrade an existing database.

    Schema:
      id           - auto-increment primary key
      title        - name of the problem
      topic        - comma-separated topics (e.g., "Arrays,DP")
      difficulty   - Easy / Medium / Hard
      date_solved  - ISO date string when first solved (YYYY-MM-DD)
      confidence   - integer 1–5 (user's self-assessment)
      next_review  - ISO date string for next scheduled revision
      custom_days  - optional integer: overrides confidence-based interval
                     NULL means "use confidence default"
      is_done      - 0 = active, 1 = marked as completed
      user_id      - Foreign Key to users.id
    """
    conn = get_db()
    
    # Users table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    
    # Problems table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS problems (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL,
            topic       TEXT    NOT NULL,
            difficulty  TEXT    NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
            date_solved TEXT    NOT NULL,
            confidence  INTEGER NOT NULL CHECK(confidence BETWEEN 1 AND 5),
            next_review TEXT    NOT NULL,
            custom_days INTEGER DEFAULT NULL,
            is_done     INTEGER DEFAULT 0,
            user_id     INTEGER
        )
    """)
    
    # Roadmap Progress table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS roadmap_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            problem_id TEXT NOT NULL,
            completed_at TEXT NOT NULL,
            UNIQUE(user_id, problem_id)
        )
    """)
    
    # Friends table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS friends (
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            PRIMARY KEY (user_id, friend_id)
        )
    """)

    # Migration: add columns to existing databases
    try:
        conn.execute("ALTER TABLE problems ADD COLUMN custom_days INTEGER DEFAULT NULL")
    except Exception:
        pass  # Column already exists — nothing to do

    try:
        conn.execute("ALTER TABLE problems ADD COLUMN is_done INTEGER DEFAULT 0")
    except Exception:
        pass  # Column already exists — nothing to do
        
    try:
        conn.execute("ALTER TABLE problems ADD COLUMN user_id INTEGER")
    except Exception:
        pass  # Column already exists — nothing to do

    conn.commit()
    conn.close()

