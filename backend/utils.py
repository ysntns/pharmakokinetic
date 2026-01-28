from typing import List
from models import DailyAdherence

def calculate_streak(daily_adherence: List[DailyAdherence]) -> int:
    """Calculate current streak of days with 100% adherence"""
    streak = 0
    for day in reversed(daily_adherence):
        if day.rate == 100.0:
            streak += 1
        else:
            break
    return streak

def calculate_longest_streak(daily_adherence: List[DailyAdherence]) -> int:
    """Calculate maximum consecutive days of 100% adherence from history"""
    max_streak = 0
    current_streak = 0
    for day in daily_adherence:
        if day.rate == 100.0:
            current_streak += 1
        else:
            max_streak = max(max_streak, current_streak)
            current_streak = 0
    return max(max_streak, current_streak)
