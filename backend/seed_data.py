"""
Seed data script for Medilog - Turkish Cardiology Medications
Populates the database with common Turkish cardiovascular drugs
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
    """Seed the database with common Turkish cardiovascular drugs"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing drugs
    await db.drugs.delete_many({})
    
    turkish_cardio_drugs = [
        {
            "name": "Coraspin 100 mg",
            "active_ingredient": "Asetilsalisilik Asit (ASA)",
            "description": "Kalp krizi ve inme riskini azaltan kan sulandırıcı ilaç",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["100mg"],
            "pharmacokinetics": {
                "absorption_time": 0.5,
                "peak_concentration_time": 1.0,
                "half_life": 0.3,
                "bioavailability": 80.0,
                "protein_binding": 90.0,
                "excretion_route": "Böbrek (renal)"
            },
            "interactions": ["Warfarin", "İbuprofen", "Metotreksat", "Kortikosteroidler"],
            "contraindications": ["Aktif kanama", "Mide ülseri", "Hemofili", "Hamilelerin son trimester"],
            "side_effects": ["Mide rahatsızlığı", "Kanama riski", "Kulak çınlaması", "Baş dönmesi"],
            "warnings": ["Aç karnına almayın", "Kanama belirtilerini izleyin", "Alkol tüketimini sınırlayın"],
            "category": "Antiplatelet / Kan Sulandırıcı"
        },
        {
            "name": "Plavix 75 mg",
            "active_ingredient": "Klopidogrel",
            "description": "Kalp krizi ve inme sonrası kullanılan kan pıhtılaşmasını önleyici ilaç",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["75mg", "300mg"],
            "pharmacokinetics": {
                "absorption_time": 1.0,
                "peak_concentration_time": 1.0,
                "half_life": 7.0,
                "bioavailability": 50.0,
                "protein_binding": 98.0,
                "metabolism_pathway": "CYP2C19",
                "excretion_route": "Böbrek ve safra yoluyla"
            },
            "interactions": ["Aspirin", "Warfarin", "Omeprazol", "NSAİİ'ler"],
            "contraindications": ["Aktif kanama", "Ağır karaciğer hastalığı"],
            "side_effects": ["Kanama", "Morarma", "Burun kanaması", "Baş ağrısı"],
            "warnings": ["Ameliyattan 5-7 gün önce kesin", "Aşırı kanama varsa doktora başvurun"],
            "category": "Antiplatelet / Kan Sulandırıcı"
        },
        {
            "name": "Concor 5 mg",
            "active_ingredient": "Bisoprolol",
            "description": "Yüksek tansiyon ve kalp yetmezliği tedavisinde kullanılan beta bloker",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["2.5mg", "5mg", "10mg"],
            "pharmacokinetics": {
                "absorption_time": 2.0,
                "peak_concentration_time": 3.0,
                "half_life": 11.0,
                "bioavailability": 90.0,
                "protein_binding": 30.0,
                "excretion_route": "Böbrek (50%) ve karaciğer (50%)"
            },
            "interactions": ["Diltiazem", "Verapamil", "İnsülin", "Adrenalin"],
            "contraindications": ["Ağır astım", "Bradikardi", "Kardiyo​jenik şok", "Dekompanse kalp yetmezliği"],
            "side_effects": ["Yorgunluk", "Baş dönmesi", "Düşük nabız", "Soğuk el-ayak"],
            "warnings": ["Aniden kesmeyin", "Nabız ve tansiyonunuzu takip edin", "Diyabetliyseniz dikkatli olun"],
            "category": "Beta Bloker / Kalp İlacı"
        },
        {
            "name": "Crestor 10 mg",
            "active_ingredient": "Rosuvastatin",
            "description": "Yüksek kolesterol tedavisinde kullanılan güçlü statin ilacı",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["5mg", "10mg", "20mg", "40mg"],
            "pharmacokinetics": {
                "absorption_time": 3.0,
                "peak_concentration_time": 5.0,
                "half_life": 19.0,
                "bioavailability": 20.0,
                "protein_binding": 88.0,
                "metabolism_pathway": "CYP2C9 (minimal)",
                "excretion_route": "Safra yoluyla (dışkı)"
            },
            "interactions": ["Gemfibrozil", "Siklosporin", "Warfarin", "Antiasitler"],
            "contraindications": ["Aktif karaciğer hastalığı", "Hamilelik", "Emzirme"],
            "side_effects": ["Kas ağrısı", "Baş ağrısı", "Karın ağrısı", "Bulantı"],
            "warnings": ["Akşam alın", "Kas ağrısı olursa doktora bildirin", "Greyfurt suyu içmeyin"],
            "category": "Statin / Kolesterol İlacı"
        },
        {
            "name": "Ezetrol 10 mg",
            "active_ingredient": "Ezetimib",
            "description": "Kolesterol emilimini azaltan ilaç, genellikle statinlerle birlikte kullanılır",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["10mg"],
            "pharmacokinetics": {
                "absorption_time": 1.0,
                "peak_concentration_time": 1.5,
                "half_life": 22.0,
                "bioavailability": 35.0,
                "protein_binding": 99.0,
                "excretion_route": "Safra ve böbrek"
            },
            "interactions": ["Fibratlar", "Siklosporin", "Statinler (birlikte kullanılabilir)"],
            "contraindications": ["Aktif karaciğer hastalığı", "Hamilelik (statin ile)"],
            "side_effects": ["Baş ağrısı", "Yorgunluk", "İshal", "Kas ağrısı"],
            "warnings": ["Günün herhangi bir saatinde alınabilir", "Karaciğer fonksiyonlarını takip edin"],
            "category": "Kolesterol Emilim İnhibitörü"
        },
        {
            "name": "Norvasc 5 mg",
            "active_ingredient": "Amlodipin",
            "description": "Yüksek tansiyon ve anjina tedavisinde kullanılan kalsiyum kanal blokeri",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["5mg", "10mg"],
            "pharmacokinetics": {
                "absorption_time": 6.0,
                "peak_concentration_time": 8.0,
                "half_life": 40.0,
                "bioavailability": 65.0,
                "protein_binding": 98.0,
                "metabolism_pathway": "Karaciğer (CYP3A4)",
                "excretion_route": "Böbrek (idrar)"
            },
            "interactions": ["Simvastatin", "Tacrolimus", "Siklosporin", "Diltiazem"],
            "contraindications": ["Ağır hipotansiyon", "Kardiyojenik şok", "Aortik stenoz"],
            "side_effects": ["Şişlik (ayaklarda)", "Baş ağrısı", "Yorgunluk", "Çarpıntı"],
            "warnings": ["Ayak şişliği normaldir", "Yavaşça ayağa kalkın (baş dönmesi)", "Greyfurt suyu içmeyin"],
            "category": "Kalsiyum Kanal Blokeri / Tansiyon İlacı"
        },
        {
            "name": "Preterax",
            "active_ingredient": "Perindopril + İndapamid",
            "description": "ACE inhibitörü ve diüretik kombinasyonu, yüksek tansiyon tedavisi",
            "dosage_forms": [DosageForm.TABLET],
            "standard_dosages": ["5mg/1.25mg", "10mg/2.5mg"],
            "pharmacokinetics": {
                "absorption_time": 1.0,
                "peak_concentration_time": 3.0,
                "half_life": 17.0,
                "bioavailability": 75.0,
                "protein_binding": 20.0,
                "excretion_route": "Böbrek"
            },
            "interactions": ["Potasyum takviyeleri", "Lityum", "NSAİİ'ler", "Diüretikler"],
            "contraindications": ["Hamilelik", "Anjiyoödem geçmişi", "Bilateral renal arter stenozu"],
            "side_effects": ["Kuru öksürük", "Baş dönmesi", "Hipotansiyon", "Yorgunluk"],
            "warnings": ["Sabah aç karnına alın", "Bol su için", "Potasyum seviyenizi kontrol edin"],
            "category": "ACE İnhibitörü + Diüretik Kombinasyonu"
        },
        {
            "name": "Delix 5 mg",
            "active_ingredient": "Ramipril",
            "description": "Kalp yetmezliği ve yüksek tansiyon tedavisinde ACE inhibitörü",
            "dosage_forms": [DosageForm.TABLET, DosageForm.CAPSULE],
            "standard_dosages": ["2.5mg", "5mg", "10mg"],
            "pharmacokinetics": {
                "absorption_time": 1.0,
                "peak_concentration_time": 3.0,
                "half_life": 13.0,
                "bioavailability": 28.0,
                "protein_binding": 73.0,
                "excretion_route": "Böbrek (60%) ve safra (40%)"
            },
            "interactions": ["NSAİİ'ler", "Potasyum", "Diüretikler", "Lityum"],
            "contraindications": ["Hamilelik", "Anjiyoödem", "Bilateral renal arter stenozu"],
            "side_effects": ["Kuru öksürük", "Baş dönmesi", "Yorgunluk", "Hipotansiyon"],
            "warnings": ["Yemeklerle veya yemeksiz alınabilir", "Hamilelikte kullanmayın", "Böbrek fonksiyonlarını izleyin"],
            "category": "ACE İnhibitörü / Kalp İlacı"
        }
    ]
    
    for drug_data in turkish_cardio_drugs:
        drug = Drug(**drug_data)
        drug_dict = drug.dict()
        drug_dict["created_at"] = drug.created_at.isoformat()
        drug_dict["updated_at"] = drug.updated_at.isoformat()
        
        result = await db.drugs.insert_one(drug_dict)
        print(f"✓ Eklendi: {drug.name} (ID: {drug.id})")
    
    print(f"\n✓ Başarıyla {len(turkish_cardio_drugs)} Türk kardiyoloji ilacı eklendi!")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_drugs())
