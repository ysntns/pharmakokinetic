from typing import List, Dict, Any
from datetime import datetime

def calculate_longest_streak_from_logs(logs: List[Dict[str, Any]]) -> int:
    """
    Calculate the longest streak of consecutive days with 100% adherence from a list of dose logs.

    Args:
        logs: List of dictionaries containing 'scheduled_time' (datetime or ISO string)
              and 'status' (string, e.g., 'taken').

    Returns:
        int: The maximum number of consecutive days (ignoring days with no doses)
             where adherence was 100%.
    """
    if not logs:
        return 0

    # Group by date
    daily_stats = {}
    for log in logs:
        # Extract date
        st = log.get("scheduled_time")
        date_str = None

        if hasattr(st, 'strftime'): # datetime object
            date_str = st.strftime("%Y-%m-%d")
        elif isinstance(st, str):
            date_str = st[:10]

        if not date_str:
            continue

        if date_str not in daily_stats:
            daily_stats[date_str] = {"scheduled": 0, "taken": 0}

        daily_stats[date_str]["scheduled"] += 1

        # Check status (assuming 'taken' or DoseStatus.TAKEN value)
        status = log.get("status")
        if status == "taken":
            daily_stats[date_str]["taken"] += 1

    # Sort by date
    sorted_dates = sorted(daily_stats.keys())

    longest_streak = 0
    current_streak = 0

    for date in sorted_dates:
        stats = daily_stats[date]
        # 100% adherence means all scheduled doses were taken
        is_perfect = (stats["scheduled"] > 0 and stats["scheduled"] == stats["taken"])

        if is_perfect:
            current_streak += 1
        else:
            longest_streak = max(longest_streak, current_streak)
            current_streak = 0

    # Final check for the streak ending at the last date
    longest_streak = max(longest_streak, current_streak)

    return longest_streak
