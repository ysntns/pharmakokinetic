# Medilog (PharmacoKinetic)

Medication tracking and adherence monitoring app with AI-powered drug recognition.

## Features

- **Drug Database** - Search, add, and manage medications with pharmacokinetic data
- **Medication Schedules** - Set up daily/weekly dosing schedules with reminders
- **Dose Tracking** - Mark doses as taken/missed/skipped with timestamps
- **Progress Analytics** - Adherence rates, streaks, and daily statistics
- **AI OCR** - Scan drug boxes with camera to auto-extract medication info (Claude Vision)
- **Authentication** - JWT-based user accounts with secure password hashing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo SDK 54), TypeScript |
| Navigation | Expo Router (file-based) |
| State | Zustand + React Query |
| Backend | FastAPI (Python) |
| Database | MongoDB (Motor async driver) |
| AI | Anthropic Claude API (Vision) |
| Auth | JWT + bcrypt |

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env  # Edit with your credentials
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env  # Edit with your backend URL
npm install
npx expo start
```

### Environment Variables

**Backend** (`.env`):
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `ANTHROPIC_API_KEY` - Claude API key for drug image analysis
- `SECRET_KEY` - JWT signing secret

**Frontend** (`.env`):
- `EXPO_PUBLIC_BACKEND_URL` - Backend API URL
- `EXPO_PUBLIC_USE_MOCK_API` - Set `true` to run without backend (demo mode)

## Build APK

```bash
cd frontend
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK output: `frontend/android/app/build/outputs/apk/release/app-release.apk`

GitHub Actions workflow also available for automated builds.

## Project Structure

```
backend/
  server.py          # FastAPI routes and business logic
  models.py          # Pydantic data models
  auth.py            # JWT authentication
  seed_data.py       # Sample data for development
frontend/
  app/               # Expo Router pages
    (tabs)/           # Tab navigation (home, doses, medications, progress)
    login.tsx         # Login screen
    register.tsx      # Registration screen
  services/           # API client and mock data
  store/              # Zustand state management
  components/         # Reusable UI components
```
