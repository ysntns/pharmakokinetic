from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class DosageForm(str, Enum):
    TABLET = "tablet"
    CAPSULE = "capsule"
    LIQUID = "liquid"
    INJECTION = "injection"
    TOPICAL = "topical"
    INHALER = "inhaler"
    PATCH = "patch"


class DoseStatus(str, Enum):
    SCHEDULED = "scheduled"
    TAKEN = "taken"
    MISSED = "missed"
    SKIPPED = "skipped"


class FrequencyType(str, Enum):
    DAILY = "daily"
    TWICE_DAILY = "twice_daily"
    THREE_TIMES_DAILY = "three_times_daily"
    FOUR_TIMES_DAILY = "four_times_daily"
    WEEKLY = "weekly"
    AS_NEEDED = "as_needed"
    CUSTOM = "custom"


# Pharmacokinetics Model
class Pharmacokinetics(BaseModel):
    absorption_time: Optional[float] = None  # hours
    peak_concentration_time: Optional[float] = None  # hours (Tmax)
    half_life: Optional[float] = None  # hours
    bioavailability: Optional[float] = None  # percentage
    protein_binding: Optional[float] = None  # percentage
    volume_distribution: Optional[float] = None  # L/kg
    clearance_rate: Optional[float] = None  # mL/min
    metabolism_pathway: Optional[str] = None
    excretion_route: Optional[str] = None


# Drug Model
class Drug(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    name: str
    active_ingredient: str
    description: Optional[str] = None
    dosage_forms: List[DosageForm] = []
    standard_dosages: List[str] = []  # e.g., ["10mg", "20mg", "50mg"]
    pharmacokinetics: Optional[Pharmacokinetics] = None
    interactions: List[str] = []  # List of drug names that interact
    contraindications: List[str] = []
    side_effects: List[str] = []
    warnings: List[str] = []
    category: Optional[str] = None  # e.g., "Antibiotic", "Analgesic"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DrugCreate(BaseModel):
    name: str
    active_ingredient: str
    description: Optional[str] = None
    dosage_forms: List[DosageForm] = []
    standard_dosages: List[str] = []
    pharmacokinetics: Optional[Pharmacokinetics] = None
    interactions: List[str] = []
    contraindications: List[str] = []
    side_effects: List[str] = []
    warnings: List[str] = []
    category: Optional[str] = None


# Medication Schedule Model
class MedicationSchedule(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    user_id: str = "default_user"  # For MVP, single user
    drug_id: str
    drug_name: str  # Denormalized for quick access
    dosage: str  # e.g., "10mg"
    dosage_form: DosageForm
    frequency: FrequencyType
    custom_frequency: Optional[str] = None  # For custom frequencies
    times_per_day: int = 1
    specific_times: List[str] = []  # e.g., ["08:00", "20:00"]
    start_date: datetime
    end_date: Optional[datetime] = None
    duration_days: Optional[int] = None
    with_food: bool = False
    special_instructions: Optional[str] = None
    reminder_enabled: bool = True
    reminder_minutes_before: int = 15
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MedicationScheduleCreate(BaseModel):
    drug_id: str
    drug_name: str
    dosage: str
    dosage_form: DosageForm
    frequency: FrequencyType
    custom_frequency: Optional[str] = None
    times_per_day: int = 1
    specific_times: List[str] = []
    start_date: datetime
    end_date: Optional[datetime] = None
    duration_days: Optional[int] = None
    with_food: bool = False
    special_instructions: Optional[str] = None
    reminder_enabled: bool = True
    reminder_minutes_before: int = 15


class MedicationScheduleUpdate(BaseModel):
    dosage: Optional[str] = None
    frequency: Optional[FrequencyType] = None
    specific_times: Optional[List[str]] = None
    end_date: Optional[datetime] = None
    active: Optional[bool] = None
    reminder_enabled: Optional[bool] = None
    special_instructions: Optional[str] = None


# Dose Log Model
class DoseLog(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    user_id: str = "default_user"
    medication_id: str
    drug_name: str  # Denormalized
    dosage: str
    scheduled_time: datetime
    actual_time: Optional[datetime] = None
    status: DoseStatus = DoseStatus.SCHEDULED
    notes: Optional[str] = None
    side_effects_reported: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DoseLogCreate(BaseModel):
    medication_id: str
    drug_name: str
    dosage: str
    scheduled_time: datetime
    status: DoseStatus = DoseStatus.SCHEDULED


class DoseLogUpdate(BaseModel):
    actual_time: Optional[datetime] = None
    status: Optional[DoseStatus] = None
    notes: Optional[str] = None
    side_effects_reported: Optional[List[str]] = None


# Progress Tracking Model
class ProgressStats(BaseModel):
    total_doses_scheduled: int = 0
    doses_taken: int = 0
    doses_missed: int = 0
    doses_skipped: int = 0
    adherence_rate: float = 0.0  # percentage
    current_streak: int = 0  # consecutive days
    longest_streak: int = 0
    total_active_medications: int = 0


class DailyAdherence(BaseModel):
    date: str  # YYYY-MM-DD
    scheduled: int
    taken: int
    missed: int
    rate: float


class ProgressTracking(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    user_id: str = "default_user"
    period_start: datetime
    period_end: datetime
    stats: ProgressStats
    daily_adherence: List[DailyAdherence] = []
    medications_summary: Dict[str, Any] = {}  # Per medication stats
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# API Response Models
class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error: Optional[str] = None
