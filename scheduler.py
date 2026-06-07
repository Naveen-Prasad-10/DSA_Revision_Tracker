"""
scheduler.py - Phase 2: Daily email reminder job.

Reads problems due today from the DB and sends a summary email via SMTP.
Run this script once daily (e.g., via Windows Task Scheduler or cron).

Usage:
  python scheduler.py

Configuration:
  Set the environment variables below or edit the CONFIG dict directly.
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from models import get_db, init_db
from utils import get_today

# ─────────────────────────────────────────
# Email configuration — edit or set as env vars
# ─────────────────────────────────────────
CONFIG = {
    "smtp_host":   os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "smtp_port":   int(os.getenv("SMTP_PORT", "587")),
    "sender":      os.getenv("EMAIL_SENDER", "your_email@gmail.com"),
    "password":    os.getenv("EMAIL_PASSWORD", "your_app_password"),
    "recipient":   os.getenv("EMAIL_RECIPIENT", "[EMAIL_ADDRESS]"),
}


def fetch_upcoming_problems(days_ahead=3):
    """Query the DB for problems due within the next N days."""
    from datetime import date, timedelta
    today = date.today()
    future_date = today + timedelta(days=days_ahead)
    
    conn = get_db()
    # Fetch active problems due between Today and Future Date (inclusive)
    # Also include overdue problems (next_review < today)
    rows = conn.execute(
        "SELECT title, topic, difficulty, next_review FROM problems "
        "WHERE next_review <= ? AND is_done = 0 ORDER BY next_review ASC",
        (future_date.isoformat(),)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def build_email_body(problems: list) -> str:
    """Build a plain-text summary of upcoming and due problems."""
    if not problems:
        return "🎉 No problems due in the next 3 days. Enjoy your break!"

    lines = [f"📋 Upcoming Coding Problems (Next 3 Days):\n"]
    for i, p in enumerate(problems, start=1):
        status = "🔴 OVERDUE" if p['next_review'] < get_today() else f"📅 Due: {p['next_review']}"
        lines.append(
            f"{i}. [{p['difficulty']}] {p['title']} — {status}\n   Topics: {p['topic']}"
        )
    lines.append(
        "\nLog in to http://127.0.0.1:5000 to revise them."
    )
    return "\n".join(lines)


def send_email(subject: str, body: str):
    """Send a plain-text email via SMTP."""
    msg = MIMEMultipart()
    msg["From"]    = CONFIG["sender"]
    msg["To"]      = CONFIG["recipient"]
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(CONFIG["smtp_host"], CONFIG["smtp_port"]) as server:
            server.starttls()                                          # Encrypt connection
            server.login(CONFIG["sender"], CONFIG["password"])
            server.sendmail(CONFIG["sender"], CONFIG["recipient"], msg.as_string())
        print(f"✅ Email sent to {CONFIG['recipient']}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")


def run():
    """Main entry point for the daily reminder job."""
    init_db()  # Ensure DB exists
    problems = fetch_upcoming_problems(days_ahead=3)
    
    # Filter for subject line count
    due_today = [p for p in problems if p['next_review'] <= get_today()]
    
    subject  = f"🧠 Coding Reminder: {len(due_today)} due today, {len(problems)} total upcoming"
    body     = build_email_body(problems)

    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print(body)  # Also print to console for logs

    if CONFIG["sender"] != "your_email@gmail.com" and CONFIG["password"] != "your_app_password":
        send_email(subject, body)
    else:
        print("\n⚠️  Email not sent: Please configure EMAIL_SENDER and EMAIL_PASSWORD in scheduler.py or as Environment Variables.")


if __name__ == "__main__":
    run()
