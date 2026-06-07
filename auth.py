from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from models import get_db
import functools

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):
        if session.get('user_id') is None:
            return jsonify({"error": "Unauthorized"}), 401
        return view(*args, **kwargs)
    return wrapped_view

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing username or password"}), 400
        
    username = data["username"].strip()
    password = data["password"]
    
    conn = get_db()
    
    # Check if exists
    if conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone():
        conn.close()
        return jsonify({"error": "Username already exists"}), 409
        
    password_hash = generate_password_hash(password)
    created_at = datetime.utcnow().isoformat()
    
    cursor = conn.execute(
        "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
        (username, password_hash, created_at)
    )
    user_id = cursor.lastrowid
    
    # ADOPTION MIGRATION: If this is the FIRST user, adopt all unassigned problems
    unassigned_count = conn.execute("SELECT COUNT(*) FROM problems WHERE user_id IS NULL").fetchone()[0]
    if unassigned_count > 0:
        # Check total users. If 1, adopt.
        user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if user_count == 1:
            conn.execute("UPDATE problems SET user_id = ? WHERE user_id IS NULL", (user_id,))
    
    conn.commit()
    conn.close()
    
    session["user_id"] = user_id
    session["username"] = username
    
    return jsonify({"message": "User registered successfully", "user": {"id": user_id, "username": username}}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing username or password"}), 400
        
    username = data["username"].strip()
    password = data["password"]
    
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 401
        
    session.clear()
    session["user_id"] = user["id"]
    session["username"] = user["username"]
    
    return jsonify({"message": "Logged in successfully", "user": {"id": user["id"], "username": user["username"]}})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})

@auth_bp.route("/me", methods=["GET"])
@login_required
def get_me():
    return jsonify({
        "user": {
            "id": session.get("user_id"),
            "username": session.get("username")
        }
    })
