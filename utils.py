"""
utils.py - Utility / helper functions for the tracker.
Contains the core spaced-repetition scheduling logic.
"""

from datetime import date, timedelta


# Default confidence → days mapping (used when no custom_days is set)
CONFIDENCE_INTERVALS = {
    1: 1,   # Low confidence  → review tomorrow
    2: 2,
    3: 4,
    4: 7,
    5: 14,  # High confidence → review in 2 weeks
}


def calculate_next_review(confidence: int, from_date: date = None,
                           custom_days: int = None) -> str:
    """
    Return the next review date as 'YYYY-MM-DD'.

    Args:
        confidence:  integer 1–5 (used when custom_days is None).
        from_date:   base date to calculate from (defaults to today).
        custom_days: if provided, overrides the confidence-based interval.
                     Must be a positive integer (e.g. 3 = review in 3 days).

    Returns:
        ISO-formatted date string for the next review.
    """
    if from_date is None:
        from_date = date.today()

    if custom_days is not None and custom_days > 0:
        interval_days = custom_days
    else:
        interval_days = CONFIDENCE_INTERVALS.get(confidence, 1)

    next_review = from_date + timedelta(days=interval_days)
    return next_review.isoformat()


def get_today() -> str:
    """Return today's date as an ISO string (YYYY-MM-DD)."""
    return date.today().isoformat()
