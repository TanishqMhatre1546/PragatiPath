# PragatiPath (प्रगतीPath) — Backend API Service

FastAPI backend with SQLite (PostgreSQL-compatible SQLAlchemy schema) and local scikit-learn ML analytics for the PragatiPath Longitudinal Skilling-Outcome Tracking Platform (Smart India Hackathon).

---

## 🚀 Quickstart (Zero-Cost, Single Command)

### Prerequisites
- Python 3.9+ installed

### Setup & Run
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies (standard local libraries, zero cost)
pip install -r requirements.txt

# 3. Start the FastAPI development server
uvicorn main:app --reload --port 8000
```

The database (`pragatipath.db`) will **automatically generate and seed itself** with authentic Maharashtra skilling data on first startup.

Interactive API Documentation (Swagger UI): **http://localhost:8000/docs**

---

## 🗄️ Database Architecture Note

This prototype utilizes **file-based SQLite** for 100% zero-cost, zero-configuration local execution. Standard SQLAlchemy declarative models and standard relational constraints are used throughout.

> **One-Line PostgreSQL Switch:** Swapping to production PostgreSQL simply requires updating the environment variable:
> `DATABASE_URL=postgresql://user:password@localhost:5432/pragatipath`
> This satisfies the **"PostgreSQL (relational)"** claim on the project's technical architecture slide with zero code changes.

---

## 🗺️ Architecture Slide Mapping

Every backend endpoint maps directly to the technical approach slide presented to the jury:

| Endpoint | Method | Architecture Slide Component | Description |
|---|---|---|---|
| `/auth/login` | `POST` | **Consent & Onboarding / RBAC** | Demo JWT issuance mapping role claims (Trainee, Employer, Govt) |
| `/trainees` | `GET` | **Identity & Record Linkage** | Trainee roster linked across districts, courses & milestones |
| `/trainees/{id}` | `GET` | **Outcome Data Collection** | Longitudinal 3/6/12 month timeline trajectory & wage history |
| `/trainees/{id}/checkin` | `POST` | **Low-Burden Check-in Engine** | <15s candidate milestone capture; triggers verification & simulated WhatsApp |
| `/verifications/pending` | `GET` | **Verification Layer** | Employer one-tap verification feed of unverified milestones |
| `/verifications/{id}/confirm` | `POST` | **Verification Layer** | Cryptographic verification confirmation (changes status to Verified) |
| `/verifications/{id}/deny` | `POST` | **Verification Layer** | Flags milestone dispute for district reconciliation |
| `/analytics/summary` | `GET` | **Analysis & Insights** | Longitudinal retention rates, wage progression curves, district/course metrics |
| `/analytics/verification-quality` | `GET` | **Audit & Verification Integrity** | Verified vs Reported outcome confidence index |
| `/analytics/skill-gaps` | `GET` | **AI/ML Layer: Skill-Gap Analysis** | **Real scikit-learn `TfidfVectorizer` + `cosine_similarity`** curriculum analysis |
| `/analytics/attrition-risk` | `GET` | **AI/ML Layer: Attrition Risk** | **Real scikit-learn `LogisticRegression`** early-warning attrition risk signals |
| `/analytics/outbound-messages` | `GET` | **Communication Engine (Simulated)** | In-app audit log of simulated WhatsApp/SMS/Email notifications |
| `/courses` | `GET` | **Curriculum & Demand Registry** | Skills taught vs employer market demand mapping |
| `/admin/reseed` | `POST` | **Demo Administration** | Instant 1-click dataset reset for live jury presentations |
