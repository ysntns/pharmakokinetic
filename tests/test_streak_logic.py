import unittest
import sys
import os
from datetime import datetime, timedelta

# Add project root to path so we can import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.streak_utils import calculate_longest_streak_from_logs

class TestStreakCalculation(unittest.TestCase):

    def test_empty_logs(self):
        self.assertEqual(calculate_longest_streak_from_logs([]), 0)

    def test_single_perfect_day(self):
        logs = [
            {"scheduled_time": "2023-01-01T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-01T20:00:00", "status": "taken"}
        ]
        self.assertEqual(calculate_longest_streak_from_logs(logs), 1)

    def test_single_failed_day(self):
        logs = [
            {"scheduled_time": "2023-01-01T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-01T20:00:00", "status": "missed"}
        ]
        self.assertEqual(calculate_longest_streak_from_logs(logs), 0)

    def test_consecutive_days(self):
        logs = [
            {"scheduled_time": "2023-01-01T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-02T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-03T08:00:00", "status": "taken"}
        ]
        self.assertEqual(calculate_longest_streak_from_logs(logs), 3)

    def test_broken_streak(self):
        logs = [
            {"scheduled_time": "2023-01-01T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-02T08:00:00", "status": "missed"},
            {"scheduled_time": "2023-01-03T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-04T08:00:00", "status": "taken"}
        ]
        # Streak 1: 2023-01-01 (1 day)
        # Streak 2: 2023-01-03, 2023-01-04 (2 days)
        # Longest should be 2
        self.assertEqual(calculate_longest_streak_from_logs(logs), 2)

    def test_gap_in_dates(self):
        # Testing the behavior where we ignore empty days (e.g. no scheduled meds)
        logs = [
            {"scheduled_time": "2023-01-01T08:00:00", "status": "taken"},
            # 2023-01-02 has no logs
            {"scheduled_time": "2023-01-03T08:00:00", "status": "taken"}
        ]
        # Current logic counts consecutive entries in the active days list
        self.assertEqual(calculate_longest_streak_from_logs(logs), 2)

    def test_mixed_datetime_types(self):
        logs = [
            {"scheduled_time": datetime(2023, 1, 1, 8, 0), "status": "taken"},
            {"scheduled_time": "2023-01-02T08:00:00", "status": "taken"}
        ]
        self.assertEqual(calculate_longest_streak_from_logs(logs), 2)

    def test_multiple_doses_per_day(self):
        logs = [
            # Day 1: Perfect (2/2)
            {"scheduled_time": "2023-01-01T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-01T20:00:00", "status": "taken"},
            # Day 2: Failed (1/2)
            {"scheduled_time": "2023-01-02T08:00:00", "status": "taken"},
            {"scheduled_time": "2023-01-02T20:00:00", "status": "missed"},
            # Day 3: Perfect (1/1)
            {"scheduled_time": "2023-01-03T08:00:00", "status": "taken"}
        ]
        # Streak 1: Day 1 (1 day)
        # Streak 2: Day 3 (1 day)
        self.assertEqual(calculate_longest_streak_from_logs(logs), 1)

if __name__ == '__main__':
    unittest.main()
