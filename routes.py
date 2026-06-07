"""
routes.py - Flask Blueprint defining all REST API endpoints for the problem tracker.

Endpoints:
  POST   /problems              - Add a new problem
  GET    /problems              - Get all problems (active + done)
  GET    /problems/today        - Get active problems due today or overdue
  GET    /problems/upcoming     - Get active problems scheduled after today
  PUT    /problems/<id>         - Edit any field(s); reschedules automatically
  PATCH  /problems/<id>/done   - Toggle is_done (mark complete / reactivate)
  DELETE /problems/<id>         - Permanently delete a problem
"""

from flask import Blueprint, request, jsonify, session
from models import get_db
from utils import calculate_next_review, get_today
from auth import login_required

problems_bp = Blueprint("problems", __name__)


# ──────────────────────────────────────────────
# POST /problems  — Add a new problem
# ──────────────────────────────────────────────
@problems_bp.route("/problems", methods=["POST"])
@login_required
def add_problem():
    """
    Expects JSON body:
    {
        "title":       "Two Sum",
        "topic":       "Arrays",        # or "Arrays,HashMap"
        "difficulty":  "Easy",
        "date_solved": "2024-01-15",    # YYYY-MM-DD
        "confidence":  3,               # 1–5
        "custom_days": 5                # optional — overrides confidence interval
    }
    """
    data = request.get_json()

    # Basic validation
    required = ["title", "topic", "difficulty", "date_solved", "confidence"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    title       = data["title"].strip()
    topic       = data["topic"].strip()
    difficulty  = data["difficulty"]
    date_solved = data["date_solved"]
    confidence  = int(data["confidence"])
    custom_days = int(data["custom_days"]) if data.get("custom_days") else None
    user_id     = session.get("user_id")

    if difficulty not in ("Easy", "Medium", "Hard"):
        return jsonify({"error": "difficulty must be Easy, Medium, or Hard"}), 400
    if not (1 <= confidence <= 5):
        return jsonify({"error": "confidence must be between 1 and 5"}), 400
    if custom_days is not None and custom_days < 1:
        return jsonify({"error": "custom_days must be a positive integer"}), 400

    next_review = calculate_next_review(confidence, custom_days=custom_days)

    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO problems (title, topic, difficulty, date_solved, confidence,
                                  next_review, custom_days, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (title, topic, difficulty, date_solved, confidence, next_review, custom_days, user_id)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message":     "Problem added successfully",
        "id":          new_id,
        "next_review": next_review,
        "custom_days": custom_days,
    }), 201


# ──────────────────────────────────────────────
# GET /problems  — Fetch all problems
# ──────────────────────────────────────────────
@problems_bp.route("/problems", methods=["GET"])
@login_required
def get_all_problems():
    """Return all problems sorted by next_review date (ascending)."""
    user_id = session.get("user_id")
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM problems WHERE user_id = ? ORDER BY next_review ASC",
        (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


# ──────────────────────────────────────────────
# GET /problems/today  — Fetch problems due today or overdue
# ──────────────────────────────────────────────
@problems_bp.route("/problems/today", methods=["GET"])
@login_required
def get_due_today():
    """Return active (not done) problems where next_review <= today."""
    today = get_today()
    user_id = session.get("user_id")
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM problems WHERE user_id = ? AND next_review <= ? AND is_done = 0 ORDER BY next_review ASC",
        (user_id, today)
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


# ──────────────────────────────────────────────
# GET /problems/upcoming  — Fetch future scheduled problems
# ──────────────────────────────────────────────
@problems_bp.route("/problems/upcoming", methods=["GET"])
@login_required
def get_upcoming():
    """Return active (not done) problems scheduled after today."""
    today = get_today()
    user_id = session.get("user_id")
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM problems WHERE user_id = ? AND next_review > ? AND is_done = 0 ORDER BY next_review ASC",
        (user_id, today)
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


# ──────────────────────────────────────────────
# PUT /problems/<id>  — Full patch: edit any field; reschedule
# ──────────────────────────────────────────────
@problems_bp.route("/problems/<int:problem_id>", methods=["PUT"])
@login_required
def update_problem(problem_id):
    """
    Update any combination of a problem's fields.
    All fields are optional — only provided fields are changed.
    """
    user_id = session.get("user_id")
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Fetch current row so we can merge changes
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM problems WHERE id = ? AND user_id = ?", (problem_id, user_id)
    ).fetchone()

    if row is None:
        conn.close()
        return jsonify({"error": "Problem not found"}), 404

    current = dict(row)

    # Merge incoming fields with current values
    title       = data.get("title",      current["title"]).strip()
    topic       = data.get("topic",      current["topic"]).strip()
    difficulty  = data.get("difficulty", current["difficulty"])
    date_solved = data.get("date_solved", current["date_solved"])
    confidence  = int(data.get("confidence", current["confidence"]))

    # custom_days: explicit 0 or null in payload clears it (revert to confidence)
    if "custom_days" in data:
        raw_cd = data["custom_days"]
        custom_days = int(raw_cd) if raw_cd and int(raw_cd) > 0 else None
    else:
        custom_days = current["custom_days"]  # keep existing value

    # Validate
    if difficulty not in ("Easy", "Medium", "Hard"):
        conn.close()
        return jsonify({"error": "difficulty must be Easy, Medium, or Hard"}), 400
    if not (1 <= confidence <= 5):
        conn.close()
        return jsonify({"error": "confidence must be between 1 and 5"}), 400

    # Recalculate next_review whenever confidence or custom_days may change
    next_review = calculate_next_review(confidence, custom_days=custom_days)

    conn.execute(
        """UPDATE problems
           SET title=?, topic=?, difficulty=?, date_solved=?,
               confidence=?, next_review=?, custom_days=?
           WHERE id=? AND user_id=?""",
        (title, topic, difficulty, date_solved,
         confidence, next_review, custom_days, problem_id, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "message":     "Problem updated",
        "id":          problem_id,
        "title":       title,
        "topic":       topic,
        "difficulty":  difficulty,
        "date_solved": date_solved,
        "confidence":  confidence,
        "custom_days": custom_days,
        "next_review": next_review,
    })


# ──────────────────────────────────────────────
# PATCH /problems/<id>/done  — Toggle done state
# ──────────────────────────────────────────────
@problems_bp.route("/problems/<int:problem_id>/done", methods=["PATCH"])
@login_required
def toggle_done(problem_id):
    """
    Toggle the is_done flag on a problem.
    """
    user_id = session.get("user_id")
    conn = get_db()
    row = conn.execute(
        "SELECT is_done FROM problems WHERE id = ? AND user_id = ?", (problem_id, user_id)
    ).fetchone()

    if row is None:
        conn.close()
        return jsonify({"error": "Problem not found"}), 404

    new_state = 0 if row["is_done"] else 1  # toggle
    conn.execute(
        "UPDATE problems SET is_done = ? WHERE id = ? AND user_id = ?", (new_state, problem_id, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Marked as done" if new_state else "Reactivated",
        "id":      problem_id,
        "is_done": new_state,
    })


# ──────────────────────────────────────────────
# DELETE /problems/<id>  — Permanently delete
# ──────────────────────────────────────────────
@problems_bp.route("/problems/<int:problem_id>", methods=["DELETE"])
@login_required
def delete_problem(problem_id):
    """
    Permanently remove a problem from the database.
    This action is irreversible.
    """
    user_id = session.get("user_id")
    conn = get_db()
    result = conn.execute(
        "DELETE FROM problems WHERE id = ? AND user_id = ?", (problem_id, user_id)
    )
    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({"error": "Problem not found"}), 404

    return jsonify({"message": "Problem deleted", "id": problem_id})
