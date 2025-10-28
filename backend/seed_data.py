"""
Seed data script for PharmacoKinetic MVP
Populates the database with sample drugs
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from models import Drug, Pharmacokinetics, DosageForm

load_dotenv()

async def seed_drugs():
    """Seed the database with common drugs"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing drugs
    await db.drugs.delete_many({})
    
    sample_drugs = [
        {
            "name": "Amoxicillin",
            "active_ingredient": "Amoxicillin trihydrate",
            "description": "Broad-spectrum antibiotic used to treat bacterial infections",
            "dosage_forms": [DosageForm.CAPSULE, DosageForm.TABLET, DosageForm.LIQUID],
            "standard_dosages": ["250mg", "500mg", "875mg"],
            "pharmacokinetics": {
                "absorption_time": 1.0,
                "peak_concentration_time": 1.5,
                "half_life": 1.0,
                "bioavailability": 90.0,
                "protein_binding": 20.0,
                "excretion_route": "Renal (60-90% unchanged)"
            },
            "interactions": ["Methotrexate", "Warfarin", "Allopurinol"],
            "contraindications": ["Penicillin allergy", "Mononucleosis"],
            "side_effects": ["Nausea", "Diarrhea", "Rash", "Vomiting"],
            "warnings": ["Complete full course", "Take with food if stomach upset"],
            "category": "Antibiotic"
        },
        {
            "name": "Lisinopril",
            "active_ingredient": "Lisinopril",
            "description": "ACE inhibitor for high blood pressure and heart failure",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["2.5mg", "5mg", "10mg", "20mg", "40mg"],
            "pharmacokinetics": {
                "absorption_time": 1.0,
                "peak_concentration_time": 7.0,
                "half_life": 12.0,
                "bioavailability": 25.0,
                "protein_binding": 0.0,
                "excretion_route": "Renal (100% unchanged)"
            },
            "interactions": ["NSAIDs", "Potassium supplements", "Lithium"],
            "contraindications": ["Pregnancy", "Angioedema history"],
            "side_effects": ["Dry cough", "Dizziness", "Headache", "Fatigue"],
            "warnings": ["Monitor blood pressure", "Check kidney function"],
            "category": "Antihypertensive"
        },
        {
            "name": "Metformin",
            "active_ingredient": "Metformin hydrochloride",
            "description": "First-line medication for type 2 diabetes",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["500mg", "850mg", "1000mg"],
            "pharmacokinetics": {
                "absorption_time": 2.5,
                "peak_concentration_time": 2.5,
                "half_life": 5.0,
                "bioavailability": 55.0,
                "protein_binding": 0.0,
                "excretion_route": "Renal (90% unchanged)"
            },
            "interactions": ["Alcohol", "Contrast dye", "Diuretics"],
            "contraindications": ["Kidney disease", "Liver disease", "Heart failure"],
            "side_effects": ["Nausea", "Diarrhea", "Gas", "Stomach upset"],
            "warnings": ["Take with food", "Monitor kidney function", "Risk of lactic acidosis"],
            "category": "Antidiabetic"
        },
        {
            "name": "Atorvastatin",
            "active_ingredient": "Atorvastatin calcium",
            "description": "Statin for lowering cholesterol and preventing cardiovascular disease",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["10mg", "20mg", "40mg", "80mg"],
            "pharmacokinetics": {
                "absorption_time": 1.0,
                "peak_concentration_time": 2.0,
                "half_life": 14.0,
                "bioavailability": 14.0,
                "protein_binding": 98.0,
                "metabolism_pathway": "CYP3A4",
                "excretion_route": "Biliary"
            },
            "interactions": ["Grapefruit juice", "Cyclosporine", "Gemfibrozil"],
            "contraindications": ["Active liver disease", "Pregnancy", "Breastfeeding"],
            "side_effects": ["Muscle pain", "Headache", "Nausea", "Diarrhea"],
            "warnings": ["Monitor liver function", "Report muscle pain", "Avoid grapefruit"],
            "category": "Statin"
        },
        {
            "name": "Omeprazole",
            "active_ingredient": "Omeprazole",
            "description": "Proton pump inhibitor for acid reflux and stomach ulcers",
            "dosage_forms": [DosageForm.CAPSULE, DosageForm.TABLET],
            "standard_dosages": ["10mg", "20mg", "40mg"],
            "pharmacokinetics": {
                "absorption_time": 0.5,
                "peak_concentration_time": 1.5,
                "half_life": 1.0,
                "bioavailability": 40.0,
                "protein_binding": 95.0,
                "metabolism_pathway": "CYP2C19, CYP3A4",
                "excretion_route": "Renal and biliary"
            },
            "interactions": ["Clopidogrel", "Warfarin", "Diazepam"],
            "contraindications": ["Hypersensitivity to PPIs"],
            "side_effects": ["Headache", "Diarrhea", "Nausea", "Abdominal pain"],
            "warnings": ["Take before meals", "Long-term use may affect bone density"],
            "category": "Proton Pump Inhibitor"
        },
        {
            "name": "Levothyroxine",
            "active_ingredient": "Levothyroxine sodium",
            "description": "Thyroid hormone replacement for hypothyroidism",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg"],
            "pharmacokinetics": {
                "absorption_time": 2.0,
                "peak_concentration_time": 4.0,
                "half_life": 168.0,
                "bioavailability": 80.0,
                "protein_binding": 99.0,
                "excretion_route": "Renal and fecal"
            },
            "interactions": ["Calcium", "Iron", "Soy", "Coffee"],
            "contraindications": ["Untreated adrenal insufficiency", "Thyrotoxicosis"],
            "side_effects": ["Weight loss", "Tremor", "Headache", "Insomnia"],
            "warnings": ["Take on empty stomach", "Wait 30-60 min before eating", "Monitor TSH levels"],
            "category": "Thyroid Hormone"
        }
    ]
    
    for drug_data in sample_drugs:
        drug = Drug(**drug_data)
        drug_dict = drug.dict()
        drug_dict["created_at"] = drug.created_at.isoformat()
        drug_dict["updated_at"] = drug.updated_at.isoformat()
        
        result = await db.drugs.insert_one(drug_dict)
        print(f"✓ Added: {drug.name} (ID: {drug.id})")
    
    print(f"\n✓ Successfully seeded {len(sample_drugs)} drugs!")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_drugs())
