# PragatiPath (प्रगतीPath) — Frontend Client

React + Vite + TypeScript + Tailwind CSS web interface with Recharts visualization for the PragatiPath Longitudinal Skilling-Outcome Tracking Platform (Smart India Hackathon).

---

## 🎨 Branding & Theme
- **Navy (`#1B3A5C`)**: Primary brand color representing institutional governance & trust.
- **Marigold (`#F5A623`)**: Brand accent color for active milestones, badges, and CTAs.
- **Light Card Background (`#F3F6F9`)** & **White Base (`#FFFFFF`)**: Clean, rounded government aesthetic without heavy gradients or stock clipart.
- **Semantic 3-Tier Badges**: Green (Verified), Amber (Pending), Red (Disputed).

---

## 🚀 Setup & Local Execution

### Prerequisites
- Node.js 18+ and npm installed

### 1. Install & Run
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server on http://localhost:3000
npm run dev
```

The frontend will automatically proxy / connect to the FastAPI backend running at `http://localhost:8000`.

---

## ⚡ Free Zero-Config Deployment to Vercel

The frontend is completely static and ready for instant deployment to Vercel with zero configuration:

1. Push this repository to GitHub.
2. In the Vercel Dashboard, click **Add New Project** → Import the GitHub repo.
3. Set **Root Directory** to `frontend`.
4. (Optional) Set Environment Variable `VITE_API_URL` to your hosted FastAPI backend URL (or leave default for local proxy).
5. Click **Deploy**. Vercel will auto-detect Vite and build the project in seconds.

---

## 🖥️ Active User Views & Demos

1. **Trainee View (`/trainee`)**:
   - Trainee selection across districts and courses
   - Longitudinal Milestone Timeline (Training → Certification → 3M → 6M → 12M)
   - Wage Progression Chart with ₹ increments
   - **"Simulate Next Check-In"** button triggering the rapid **<15-second conversational modal**
   - Candidate outbound WhatsApp message audit feed

2. **Employer View (`/employer`)**:
   - Frictionless 1-tap verification queue
   - 3-tier status badges (Verified, Pending, Disputed)
   - Single-tap **Confirm** and **Deny** buttons
   - Audit trail of historical confirmations

3. **Government Official View (`/government`)**:
   - State overview KPIs (Cohort size, Placement %, Average Wage Gain, Audit Confidence)
   - Longitudinal Retention & Wage curves (Recharts)
   - District (Pune, Nashik, Nagpur) and Course comparative matrices
   - **Real Scikit-Learn Skill-Gap Analysis Card** (TF-IDF Vectorizer + Cosine Similarity)
   - **Real Scikit-Learn Attrition Risk Predictor Card** (Logistic Regression risk signals with visible ethical disclaimer)
   - Verified vs Reported Quality Assurance card
   - Outbound Communication Engine Log (WhatsApp/SMS/Email)
