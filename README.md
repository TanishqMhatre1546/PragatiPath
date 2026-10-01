# PragatiPath (प्रगतीPath) — Longitudinal Skilling-Outcome Tracking Platform
### Smart India Hackathon Prototype (40–50% Functional Scope)

> **Zero-Cost, Zero External Accounts, 100% Free Tier Cloud & Local Stack**  
> **Frontend:** React + Vite + TypeScript + Tailwind CSS + Recharts  
> **Backend:** Python + FastAPI + SQLAlchemy + SQLite (PostgreSQL-Ready)  
> **AI / Analytics:** Local Scikit-Learn (`TfidfVectorizer` + `LogisticRegression`)  

---

## 🌐 Live Deployed Application

- **Live Frontend App:** [https://pragatipath-frontend.onrender.com](https://pragatipath-frontend.onrender.com) *(or your deployed Render static URL)*
- **Live Backend API (Docs & Swagger):** [https://pragatipath-backend.onrender.com/docs](https://pragatipath-backend.onrender.com/docs)
- **Backend Health Check:** [https://pragatipath-backend.onrender.com/health](https://pragatipath-backend.onrender.com/health)

> *Note: Free tier services on Render spin down after inactivity and may take 30–50 seconds on initial wake up.*

---

## 🏛️ Project Description

**PragatiPath (प्रगतीPath)** is a longitudinal tracking and verification platform designed to measure the real-world employment and wage trajectories of vocational trainees across **Month 3, Month 6, and Month 12** milestones. Rather than relying on one-off post-training self-reports or high-friction paperwork, PragatiPath provides low-burden candidate check-ins in under 15 seconds, 1-tap employer cryptographic verifications without mandatory logins, and local scikit-learn machine learning analytics for syllabus skill-gap quantification and early-warning attrition risk signals.

---

## 🧭 Functional Scope & Features

### ✅ Fully Implemented & Live in Prototype (100% Functional)
- **Feature 1 — Trainee Longitudinal Journey & Rapid Check-In:**
  - Trainee profile selector across 28 candidates in Maharashtra (Pune, Nashik, Nagpur).
  - Visual milestone timeline (Training → Certification → Month 3 → Month 6 → Month 12).
  - Dynamic wage progression curve with ₹ currency increments.
  - Interactive **<15-second conversational check-in modal** that updates the database, creates a pending verification request, and simulates an outbound WhatsApp alert.
- **Feature 2 — Employer 1-Tap Verification:**
  - One-tap employer approval feed.
  - Unmistakable **3-tier visual badges**: Verified (Green), Pending (Amber), Disputed (Red).
  - 1-click **Confirm** and **Deny** buttons with instant database resolution and outbound audit logging.
- **Feature 3 — Government Official Analytics Dashboard:**
  - Overall cohort metrics: Total Trainees, Verified Employment %, Average Wage Gain (₹ and %), Audit Confidence Index.
  - Longitudinal retention rate vs average wage progression chart (Month 3 to 12).
  - Status breakdown (Employed, Self-Employed, Apprentice, Unemployed) & District matrices.
  - **REAL Scikit-Learn Skill-Gap Analysis:** Uses `TfidfVectorizer` + `cosine_similarity` to mathematically calculate keyword overlap between curriculum taught and employer demand, flagging courses below 50% threshold.
  - **REAL Scikit-Learn Attrition Risk Predictor:** Uses a trained `LogisticRegression` pipeline on candidate wage, district, course, and employer continuity features to predict risk probabilities, labeled with mandatory ethical disclaimer: *"Risk signal, not a certainty."*
  - **Verified vs Reported Quality Assurance Card:** Visualizing self-reported vs employer-authenticated milestones.
  - **Simulated Communication Engine Log:** Live in-app outbound notification table (WhatsApp, SMS, Email).

### 🚧 Transparently Stubbed for Phase 2 (Cleanly Labeled in UI)
- **Training Provider Portal** & **Policymaker Macro Simulator:** Labeled with "Phase 2 Roadmap / Stub" in the navigation bar.
- **Direct WhatsApp API / SMS Gateways:** Simulated via the in-app outbound message log per hackathon constraints.
- **Aadhaar e-KYC & Live MSSDS / Mahaswayam / SIDH APIs:** Replaced by simplified demo authentication and auto-seeding.

---

## ⚡ Zero-Cost Architecture Guarantee

- **Zero Cloud Costs:** Fully operational on Render's free tier (`render.yaml`) and local machines.
- **Ephemeral SQLite Re-Seeding:** Uses SQLite with automated self-seeding (`seed.py`) on startup, perfectly suited for zero-cost ephemeral deployments without requiring paid managed DBs.
- **PostgreSQL Compatibility:** Runs locally or in cloud on SQLite (`pragatipath.db`). Changing `DATABASE_URL` in `database.py` to PostgreSQL is a 1-line configuration change.
- **Local Machine Learning:** Runs standard open-source `scikit-learn` in the Python environment without external AI API fees.

---

## 🚀 Local Setup Instructions

### 1. Setup & Start Backend (FastAPI + SQLite + Scikit-Learn)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Backend runs at `http://localhost:8000` (Interactive Swagger docs available at `http://localhost:8000/docs`). On first launch, the database auto-initializes with 28 candidates across 4 courses and 3 districts.*

### 2. Setup & Start Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173` (or configured port). It connects to `http://localhost:8000` by default or whatever `VITE_API_URL` is set in `.env`.*

---

## ☁️ Render Deployment (Infrastructure as Code)

Both services are configured via `render.yaml` at the repository root.
1. Connect this GitHub repository to Render as a **Blueprint Instance**.
2. Render deploys both `pragatipath-backend` (Python Web Service) and `pragatipath-frontend` (Static Site) automatically.
3. Health check path `/health` keeps backend monitoring active.

---

## 🎯 Quick Demo Walkthrough for Evaluators

1. **Switch Roles:** Use the header role switcher to jump between **Trainee**, **Employer**, and **Government** views.
2. **Submit a Check-In (Trainee View):**
   - Select candidate **Rohan Patil** (Pune, Electrician).
   - Click **"Simulate Next Check-In"**.
   - Tap through the 3 quick questions in <15 seconds (Status: Employed, Wage: ₹18,000, Same Employer: Yes).
   - Submit and observe the timeline update, pending verification request creation, and outbound WhatsApp notification.
3. **Approve Employment (Employer View):**
   - Switch to **Employer View**.
   - Notice the pending verification request for Rohan Patil.
   - Click **"1-Tap Confirm"** to authenticate the candidate's milestone.
   - Notice the green **Verified** badge and the timestamped audit log.
4. **Inspect State AI Analytics (Government View):**
   - Switch to **Government View**.
   - Review the **Skill-Gap Analysis** card powered by real scikit-learn TF-IDF.
   - Review the **Attrition Risk** table powered by real scikit-learn Logistic Regression with decision-support disclaimer.
   - Click **"Reset Demo Data"** in the top bar anytime to reset back to pristine seed state.
