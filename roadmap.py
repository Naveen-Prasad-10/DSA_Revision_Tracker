from flask import Blueprint, request, jsonify, session
from datetime import datetime
from models import get_db
from auth import login_required

roadmap_bp = Blueprint("roadmap", __name__, url_prefix="/roadmap")

@roadmap_bp.route("/progress", methods=["GET"])
@login_required
def get_progress():
    user_id = session.get("user_id")
    conn = get_db()
    rows = conn.execute("SELECT problem_id FROM roadmap_progress WHERE user_id = ?", (user_id,)).fetchall()
    conn.close()
    
    # Return array of completed problem IDs
    completed_ids = [int(row["problem_id"]) if row["problem_id"].isdigit() else row["problem_id"] for row in rows]
    return jsonify(completed_ids)

@roadmap_bp.route("/progress/toggle", methods=["POST"])
@login_required
def toggle_progress():
    data = request.get_json()
    if "problem_id" not in data:
        return jsonify({"error": "Missing problem_id"}), 400
        
    problem_id = str(data["problem_id"])
    user_id = session.get("user_id")
    conn = get_db()
    
    row = conn.execute("SELECT id FROM roadmap_progress WHERE user_id = ? AND problem_id = ?", (user_id, problem_id)).fetchone()
    
    if row:
        # Delete it (untoggle)
        conn.execute("DELETE FROM roadmap_progress WHERE id = ?", (row["id"],))
        action = "removed"
    else:
        # Add it (toggle)
        completed_at = datetime.utcnow().isoformat()
        conn.execute(
            "INSERT INTO roadmap_progress (user_id, problem_id, completed_at) VALUES (?, ?, ?)",
            (user_id, problem_id, completed_at)
        )
        action = "added"
        
    conn.commit()
    conn.close()
    
    return jsonify({"message": f"Problem {action}", "action": action, "problem_id": problem_id})

@roadmap_bp.route("/progress/sync", methods=["POST"])
@login_required
def sync_progress():
    """Takes an array of problem_ids from localStorage and inserts them if they don't exist"""
    data = request.get_json()
    completed_ids = data.get("completed_ids", [])
    
    if not isinstance(completed_ids, list):
        return jsonify({"error": "completed_ids must be an array"}), 400
        
    user_id = session.get("user_id")
    completed_at = datetime.utcnow().isoformat()
    
    conn = get_db()
    
    for pid in completed_ids:
        problem_id = str(pid)
        conn.execute(
            """INSERT INTO roadmap_progress (user_id, problem_id, completed_at) 
               VALUES (?, ?, ?) 
               ON CONFLICT(user_id, problem_id) DO NOTHING""",
            (user_id, problem_id, completed_at)
        )
        
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Progress synced successfully"})
