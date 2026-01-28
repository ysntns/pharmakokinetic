import sys
import os
import pytest

# Add backend directory to sys.path to allow imports
# Assuming the test is run from repo root, but to be safe when importing from sibling dirs
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import DailyAdherence
from utils import calculate_streak, calculate_longest_streak

def create_day(date_str, rate):
    return DailyAdherence(
        date=date_str,
        scheduled=1,
        taken=1 if rate == 100 else 0,
        missed=0 if rate == 100 else 1,
        rate=float(rate)
    )

def test_calculate_streak_empty():
    assert calculate_streak([]) == 0

def test_calculate_longest_streak_empty():
    assert calculate_longest_streak([]) == 0

def test_calculate_streak_all_100():
    days = [
        create_day("2023-01-01", 100),
        create_day("2023-01-02", 100),
        create_day("2023-01-03", 100)
    ]
    assert calculate_streak(days) == 3
    assert calculate_longest_streak(days) == 3

def test_calculate_streak_broken():
    days = [
        create_day("2023-01-01", 100),
        create_day("2023-01-02", 0),
        create_day("2023-01-03", 100),
        create_day("2023-01-04", 100)
    ]
    # Current streak (looking from end) is 2
    assert calculate_streak(days) == 2
    # Longest streak is 2
    assert calculate_longest_streak(days) == 2

def test_calculate_streak_broken_at_end():
    days = [
        create_day("2023-01-01", 100),
        create_day("2023-01-02", 100),
        create_day("2023-01-03", 0)
    ]
    assert calculate_streak(days) == 0
    assert calculate_longest_streak(days) == 2

def test_longest_streak_in_middle():
    days = [
        create_day("2023-01-01", 100),
        create_day("2023-01-02", 100),
        create_day("2023-01-03", 100),
        create_day("2023-01-04", 0),
        create_day("2023-01-05", 100),
        create_day("2023-01-06", 100)
    ]
    assert calculate_streak(days) == 2
    assert calculate_longest_streak(days) == 3

def test_multiple_streaks():
    days = [
        create_day("2023-01-01", 100), # 1
        create_day("2023-01-02", 0),
        create_day("2023-01-03", 100), # 1
        create_day("2023-01-04", 100), # 2
        create_day("2023-01-05", 0),
        create_day("2023-01-06", 100), # 1
        create_day("2023-01-07", 100), # 2
        create_day("2023-01-08", 100), # 3
        create_day("2023-01-09", 0)
    ]
    assert calculate_streak(days) == 0
    assert calculate_longest_streak(days) == 3
