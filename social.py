from flask import Blueprint, request, jsonify, session
from models import get_db
from auth import login_required
from datetime import date, timedelta
import json

social_bp = Blueprint("social", __name__, url_prefix="/social")

@social_bp.route("/search", methods=["GET"])
@login_required
def search_users():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([])
        
    user_id = session.get("user_id")
    conn = get_db()
    # Basic search for username containing query, exclude self
    rows = conn.execute(
        "SELECT id, username FROM users WHERE username LIKE ? AND id != ? LIMIT 20",
        (f"%{query}%", user_id)
    ).fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in rows])

@social_bp.route("/request/<int:friend_id>", methods=["POST"])
@login_required
def send_request(friend_id):
    user_id = session.get("user_id")
    if user_id == friend_id:
        return jsonify({"error": "Cannot friend yourself"}), 400
        
    conn = get_db()
    # Check if exists
    existing = conn.execute(
        "SELECT status FROM friends WHERE user_id = ? AND friend_id = ?",
        (user_id, friend_id)
    ).fetchone()
    
    if existing:
        return jsonify({"error": "Request already sent or friends already"}), 400
        
    # Also check if they already sent us a request
    reverse = conn.execute(
        "SELECT status FROM friends WHERE user_id = ? AND friend_id = ?",
        (friend_id, user_id)
    ).fetchone()
    
    if reverse and reverse["status"] == "pending":
        # Auto-accept
        conn.execute("UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ?", (friend_id, user_id))
        conn.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", (user_id, friend_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Friend request accepted"})
        
    # Send request
    conn.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')", (user_id, friend_id))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Friend request sent"})

@social_bp.route("/accept/<int:friend_id>", methods=["POST"])
@login_required
def accept_request(friend_id):
    user_id = session.get("user_id")
    conn = get_db()
    
    # Check if there is a pending request from friend_id to user_id
    req = conn.execute(
        "SELECT status FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
        (friend_id, user_id)
    ).fetchone()
    
    if not req:
        conn.close()
        return jsonify({"error": "No pending request"}), 404
        
    conn.execute("UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ?", (friend_id, user_id))
    conn.execute("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", (user_id, friend_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Friend request accepted"})

@social_bp.route("/friend/<int:friend_id>", methods=["DELETE"])
@login_required
def remove_friend(friend_id):
    user_id = session.get("user_id")
    conn = get_db()
    
    conn.execute("DELETE FROM friends WHERE user_id = ? AND friend_id = ?", (user_id, friend_id))
    conn.execute("DELETE FROM friends WHERE user_id = ? AND friend_id = ?", (friend_id, user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Friend/Request removed"})

@social_bp.route("/friends", methods=["GET"])
@login_required
def get_friends():
    user_id = session.get("user_id")
    conn = get_db()
    
    # Accepted friends
    friends_rows = conn.execute(
        """SELECT u.id, u.username 
           FROM friends f JOIN users u ON f.friend_id = u.id 
           WHERE f.user_id = ? AND f.status = 'accepted'""",
        (user_id,)
    ).fetchall()
    
    # Pending incoming requests (friend_id = user_id)
    pending_rows = conn.execute(
        """SELECT u.id, u.username 
           FROM friends f JOIN users u ON f.user_id = u.id 
           WHERE f.friend_id = ? AND f.status = 'pending'""",
        (user_id,)
    ).fetchall()
    
    # Sent outgoing requests
    sent_rows = conn.execute(
        """SELECT u.id, u.username 
           FROM friends f JOIN users u ON f.friend_id = u.id 
           WHERE f.user_id = ? AND f.status = 'pending'""",
        (user_id,)
    ).fetchall()
    
    conn.close()
    
    return jsonify({
        "friends": [dict(r) for r in friends_rows],
        "pending": [dict(r) for r in pending_rows],
        "sent": [dict(r) for r in sent_rows]
    })

@social_bp.route("/profile/<int:friend_id>", methods=["GET"])
@login_required
def public_profile(friend_id):
    user_id = session.get("user_id")
    conn = get_db()
    
    # Verify friendship (or viewing self)
    if user_id != friend_id:
        status = conn.execute(
            "SELECT status FROM friends WHERE user_id = ? AND friend_id = ?",
            (user_id, friend_id)
        ).fetchone()
        
        if not status or status["status"] != "accepted":
            conn.close()
            return jsonify({"error": "Profile is private"}), 403
            
    # Fetch user info
    user = conn.execute("SELECT username FROM users WHERE id = ?", (friend_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404
        
    username = user["username"]
    
    # Fetch public stats
    total_solved = conn.execute("SELECT COUNT(*) FROM problems WHERE user_id = ? AND is_done = 1", (friend_id,)).fetchone()[0]
    
    diff_rows = conn.execute(
        "SELECT difficulty, COUNT(*) as count FROM problems WHERE user_id = ? AND is_done = 1 GROUP BY difficulty",
        (friend_id,)
    ).fetchall()
    difficulties = {r["difficulty"]: r["count"] for r in diff_rows}
    
    # Recent solved problems
    recent_rows = conn.execute(
        "SELECT title, difficulty, date_solved FROM problems WHERE user_id = ? AND is_done = 1 ORDER BY date_solved DESC LIMIT 10",
        (friend_id,)
    ).fetchall()
    recent_problems = [dict(r) for r in recent_rows]
    
    # Roadmap progress
    roadmap_count = conn.execute("SELECT COUNT(*) FROM roadmap_progress WHERE user_id = ?", (friend_id,)).fetchone()[0]
    
    # Streak calculation
    streak_rows = conn.execute(
        "SELECT DISTINCT date_solved FROM problems WHERE user_id = ? ORDER BY date_solved ASC", (friend_id,)
    ).fetchall()
    
    dates = sorted({date.fromisoformat(row["date_solved"]) for row in streak_rows}) if streak_rows else []
    today = date.today()
    current_streak = 0
    if dates and dates[-1] >= today - timedelta(days=1):
        current_streak = 1
        for i in range(len(dates) - 2, -1, -1):
            if (dates[i + 1] - dates[i]).days == 1:
                current_streak += 1
            else:
                break
                
    conn.close()
    
    return jsonify({
        "username": username,
        "total_solved": total_solved,
        "difficulties": difficulties,
        "current_streak": current_streak,
        "roadmap_count": roadmap_count,
        "recent_problems": recent_problems
    })
