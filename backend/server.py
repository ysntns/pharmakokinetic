from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta
from models import (
    Drug, DrugCreate,
    MedicationSchedule, MedicationScheduleCreate, MedicationScheduleUpdate,
    DoseLog, DoseLogCreate, DoseLogUpdate,
    ProgressTracking, ProgressStats, DailyAdherence,
    SuccessResponse, DoseStatus
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="PharmacoKinetic API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ DRUG ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "PharmacoKinetic API v1.0", "status": "active"}


@api_router.post("/drugs", response_model=Drug)
async def create_drug(drug: DrugCreate):
    """Create a new drug in the database"""
    drug_obj = Drug(**drug.dict())
    drug_dict = drug_obj.dict()
    
    # Convert datetime objects to ISO format for MongoDB
    drug_dict["created_at"] = drug_obj.created_at.isoformat()
    drug_dict["updated_at"] = drug_obj.updated_at.isoformat()
    
    result = await db.drugs.insert_one(drug_dict)
    if result.inserted_id:
        return drug_obj
    raise HTTPException(status_code=500, detail="Failed to create drug")


@api_router.get("/drugs", response_model=List[Drug])
async def get_drugs(search: Optional[str] = None, category: Optional[str] = None):
    """Get all drugs, optionally filtered by search term or category"""
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"active_ingredient": {"$regex": search, "$options": "i"}}
        ]
    if category:
        query["category"] = category
    
    drugs = await db.drugs.find(query).to_list(1000)
    return [Drug(**drug) for drug in drugs]


@api_router.get("/drugs/{drug_id}", response_model=Drug)
async def get_drug(drug_id: str):
    """Get a specific drug by ID"""
    drug = await db.drugs.find_one({"id": drug_id})
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    return Drug(**drug)


@api_router.put("/drugs/{drug_id}", response_model=Drug)
async def update_drug(drug_id: str, drug: DrugCreate):
    """Update an existing drug"""
    existing = await db.drugs.find_one({"id": drug_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Drug not found")
    
    update_data = drug.dict()
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    await db.drugs.update_one({"id": drug_id}, {"$set": update_data})
    updated_drug = await db.drugs.find_one({"id": drug_id})
    return Drug(**updated_drug)


@api_router.delete("/drugs/{drug_id}", response_model=SuccessResponse)
async def delete_drug(drug_id: str):
    """Delete a drug"""
    result = await db.drugs.delete_one({"id": drug_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Drug not found")
    return SuccessResponse(message="Drug deleted successfully")


# ============ MEDICATION SCHEDULE ROUTES ============

@api_router.post("/medications", response_model=MedicationSchedule)
async def create_medication_schedule(medication: MedicationScheduleCreate):
    """Create a new medication schedule"""
    med_obj = MedicationSchedule(**medication.dict())
    med_dict = med_obj.dict()
    
    # Convert datetime objects to ISO format
    med_dict["start_date"] = med_obj.start_date.isoformat()
    if med_obj.end_date:
        med_dict["end_date"] = med_obj.end_date.isoformat()
    med_dict["created_at"] = med_obj.created_at.isoformat()
    med_dict["updated_at"] = med_obj.updated_at.isoformat()
    
    result = await db.medications.insert_one(med_dict)
    if result.inserted_id:
        # Generate dose logs for this medication
        await generate_dose_logs(med_obj)
        return med_obj
    raise HTTPException(status_code=500, detail="Failed to create medication schedule")


@api_router.get("/medications", response_model=List[MedicationSchedule])
async def get_medications(active_only: bool = True):
    """Get all medication schedules"""
    query = {}
    if active_only:
        query["active"] = True
    
    medications = await db.medications.find(query).sort("created_at", -1).to_list(1000)
    return [MedicationSchedule(**med) for med in medications]


@api_router.get("/medications/{medication_id}", response_model=MedicationSchedule)
async def get_medication(medication_id: str):
    """Get a specific medication schedule"""
    medication = await db.medications.find_one({"id": medication_id})
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    return MedicationSchedule(**medication)


@api_router.put("/medications/{medication_id}", response_model=MedicationSchedule)
async def update_medication(medication_id: str, medication: MedicationScheduleUpdate):
    """Update a medication schedule"""
    existing = await db.medications.find_one({"id": medication_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    update_data = {k: v for k, v in medication.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    await db.medications.update_one({"id": medication_id}, {"$set": update_data})
    updated_med = await db.medications.find_one({"id": medication_id})
    return MedicationSchedule(**updated_med)


@api_router.delete("/medications/{medication_id}", response_model=SuccessResponse)
async def delete_medication(medication_id: str):
    """Delete a medication schedule"""
    result = await db.medications.delete_one({"id": medication_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Also delete associated dose logs
    await db.dose_logs.delete_many({"medication_id": medication_id})
    return SuccessResponse(message="Medication deleted successfully")


# ============ DOSE LOG ROUTES ============

@api_router.post("/doses", response_model=DoseLog)
async def create_dose_log(dose: DoseLogCreate):
    """Create a new dose log"""
    dose_obj = DoseLog(**dose.dict())
    dose_dict = dose_obj.dict()
    
    dose_dict["scheduled_time"] = dose_obj.scheduled_time.isoformat()
    if dose_obj.actual_time:
        dose_dict["actual_time"] = dose_obj.actual_time.isoformat()
    dose_dict["created_at"] = dose_obj.created_at.isoformat()
    dose_dict["updated_at"] = dose_obj.updated_at.isoformat()
    
    result = await db.dose_logs.insert_one(dose_dict)
    if result.inserted_id:
        return dose_obj
    raise HTTPException(status_code=500, detail="Failed to create dose log")


@api_router.get("/doses", response_model=List[DoseLog])
async def get_dose_logs(
    medication_id: Optional[str] = None,
    status: Optional[DoseStatus] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get dose logs with optional filters"""
    query = {}
    if medication_id:
        query["medication_id"] = medication_id
    if status:
        query["status"] = status
    if start_date:
        query["scheduled_time"] = {"$gte": start_date}
    if end_date:
        if "scheduled_time" not in query:
            query["scheduled_time"] = {}
        query["scheduled_time"]["$lte"] = end_date
    
    doses = await db.dose_logs.find(query).sort("scheduled_time", -1).to_list(1000)
    return [DoseLog(**dose) for dose in doses]


@api_router.get("/doses/{dose_id}", response_model=DoseLog)
async def get_dose_log(dose_id: str):
    """Get a specific dose log"""
    dose = await db.dose_logs.find_one({"id": dose_id})
    if not dose:
        raise HTTPException(status_code=404, detail="Dose log not found")
    return DoseLog(**dose)


@api_router.put("/doses/{dose_id}", response_model=DoseLog)
async def update_dose_log(dose_id: str, dose: DoseLogUpdate):
    """Update a dose log (e.g., mark as taken)"""
    existing = await db.dose_logs.find_one({"id": dose_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Dose log not found")
    
    update_data = {k: v for k, v in dose.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    if dose.actual_time:
        update_data["actual_time"] = dose.actual_time.isoformat()
    
    await db.dose_logs.update_one({"id": dose_id}, {"$set": update_data})
    updated_dose = await db.dose_logs.find_one({"id": dose_id})
    return DoseLog(**updated_dose)


@api_router.post("/doses/{dose_id}/take", response_model=DoseLog)
async def mark_dose_taken(dose_id: str, notes: Optional[str] = None):
    """Quick action to mark a dose as taken"""
    existing = await db.dose_logs.find_one({"id": dose_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Dose log not found")
    
    update_data = {
        "status": DoseStatus.TAKEN,
        "actual_time": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    if notes:
        update_data["notes"] = notes
    
    await db.dose_logs.update_one({"id": dose_id}, {"$set": update_data})
    updated_dose = await db.dose_logs.find_one({"id": dose_id})
    return DoseLog(**updated_dose)


# ============ PROGRESS TRACKING ROUTES ============

@api_router.get("/progress", response_model=ProgressTracking)
async def get_progress(days: int = 30):
    """Get progress statistics for the specified number of days"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get all dose logs in the period
    doses = await db.dose_logs.find({
        "scheduled_time": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }).to_list(10000)
    
    # Calculate statistics
    total_scheduled = len(doses)
    taken = len([d for d in doses if d.get("status") == DoseStatus.TAKEN])
    missed = len([d for d in doses if d.get("status") == DoseStatus.MISSED])
    skipped = len([d for d in doses if d.get("status") == DoseStatus.SKIPPED])
    
    adherence_rate = (taken / total_scheduled * 100) if total_scheduled > 0 else 0
    
    # Get active medications count
    active_meds = await db.medications.count_documents({"active": True})
    
    # Calculate daily adherence
    daily_stats = {}
    for dose in doses:
        date_str = dose.get("scheduled_time", "")[:10]  # YYYY-MM-DD
        if date_str not in daily_stats:
            daily_stats[date_str] = {"scheduled": 0, "taken": 0, "missed": 0}
        
        daily_stats[date_str]["scheduled"] += 1
        if dose.get("status") == DoseStatus.TAKEN:
            daily_stats[date_str]["taken"] += 1
        elif dose.get("status") == DoseStatus.MISSED:
            daily_stats[date_str]["missed"] += 1
    
    daily_adherence = [
        DailyAdherence(
            date=date,
            scheduled=stats["scheduled"],
            taken=stats["taken"],
            missed=stats["missed"],
            rate=(stats["taken"] / stats["scheduled"] * 100) if stats["scheduled"] > 0 else 0
        )
        for date, stats in sorted(daily_stats.items())
    ]
    
    # Calculate streak
    current_streak = calculate_streak(daily_adherence)
    
    stats = ProgressStats(
        total_doses_scheduled=total_scheduled,
        doses_taken=taken,
        doses_missed=missed,
        doses_skipped=skipped,
        adherence_rate=round(adherence_rate, 2),
        current_streak=current_streak,
        longest_streak=current_streak,  # TODO: Implement proper longest streak calculation
        total_active_medications=active_meds
    )
    
    progress = ProgressTracking(
        period_start=start_date,
        period_end=end_date,
        stats=stats,
        daily_adherence=daily_adherence
    )
    
    return progress


# ============ HELPER FUNCTIONS ============

async def generate_dose_logs(medication: MedicationSchedule):
    """Generate dose logs for a medication schedule"""
    # For MVP, generate logs for next 7 days
    days_to_generate = 7
    start_date = medication.start_date
    
    for day in range(days_to_generate):
        current_date = start_date + timedelta(days=day)
        
        # Generate logs based on frequency
        for time_str in medication.specific_times:
            hour, minute = map(int, time_str.split(":"))
            scheduled_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            dose_log = DoseLog(
                medication_id=medication.id,
                drug_name=medication.drug_name,
                dosage=medication.dosage,
                scheduled_time=scheduled_time,
                status=DoseStatus.SCHEDULED
            )
            
            dose_dict = dose_log.dict()
            dose_dict["scheduled_time"] = dose_log.scheduled_time.isoformat()
            dose_dict["created_at"] = dose_log.created_at.isoformat()
            dose_dict["updated_at"] = dose_log.updated_at.isoformat()
            
            await db.dose_logs.insert_one(dose_dict)


def calculate_streak(daily_adherence: List[DailyAdherence]) -> int:
    """Calculate current streak of days with 100% adherence"""
    streak = 0
    for day in reversed(daily_adherence):
        if day.rate == 100.0:
            streak += 1
        else:
            break
    return streak


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
