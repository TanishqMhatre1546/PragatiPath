from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Trainee, Checkpoint, VerificationRequest, OutboundMessage, Course, EmployerDemand
from ml_models import compute_skill_gap_analysis, attrition_model

router = APIRouter(prefix="/analytics", tags=["Government Analytics"])


@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    FEATURE 3: Longitudinal skilling outcomes summary.
    Returns overall status split, retention rates by month mark, wage progression curves,
    and granular breakdowns across districts and courses.
    """
    trainees = db.query(Trainee).all()
    total_trainees = len(trainees)

    # 1. Current Status Split
    status_counts = {"employed": 0, "self-employed": 0, "apprentice": 0, "unemployed": 0}
    for t in trainees:
        status_key = t.current_status.lower()
        if status_key in status_counts:
            status_counts[status_key] += 1
        else:
            status_counts["employed"] += 1

    status_split = [
        {"status": "Employed", "count": status_counts["employed"], "percentage": round((status_counts["employed"] / max(total_trainees, 1)) * 100, 1)},
        {"status": "Self-Employed", "count": status_counts["self-employed"], "percentage": round((status_counts["self-employed"] / max(total_trainees, 1)) * 100, 1)},
        {"status": "Apprentice", "count": status_counts["apprentice"], "percentage": round((status_counts["apprentice"] / max(total_trainees, 1)) * 100, 1)},
        {"status": "Unemployed", "count": status_counts["unemployed"], "percentage": round((status_counts["unemployed"] / max(total_trainees, 1)) * 100, 1)},
    ]

    # Active Employment Rate (Employed + Self-Employed + Apprentice)
    active_employed = status_counts["employed"] + status_counts["self-employed"] + status_counts["apprentice"]
    overall_employment_rate = round((active_employed / max(total_trainees, 1)) * 100, 1)

    # 2. Longitudinal Retention & Wage Progression by Month Mark (3m, 6m, 12m)
    checkpoints = db.query(Checkpoint).all()
    month_stats = {3: {"total": 0, "employed": 0, "wages": []}, 6: {"total": 0, "employed": 0, "wages": []}, 12: {"total": 0, "employed": 0, "wages": []}}

    for cp in checkpoints:
        if cp.month_mark in month_stats:
            month_stats[cp.month_mark]["total"] += 1
            if cp.status in ["employed", "self-employed", "apprentice"]:
                month_stats[cp.month_mark]["employed"] += 1
            if cp.wage and cp.wage > 0:
                month_stats[cp.month_mark]["wages"].append(cp.wage)

    longitudinal_progression = []
    for mark in [3, 6, 12]:
        data = month_stats[mark]
        tot = data["total"]
        emp = data["employed"]
        wages = data["wages"]

        retention_rate = round((emp / max(tot, 1)) * 100, 1) if tot > 0 else 0.0
        avg_wage = round(sum(wages) / max(len(wages), 1), 0) if wages else 0.0

        longitudinal_progression.append({
            "month_mark": f"Month {mark}",
            "month_number": mark,
            "total_candidates": tot,
            "retained_candidates": emp,
            "retention_rate": retention_rate,
            "average_wage": avg_wage
        })

    # 3. Outcome Breakdown by District
    districts = ["Pune", "Nashik", "Nagpur"]
    district_breakdown = []
    for dist in districts:
        dist_trainees = [t for t in trainees if t.district == dist]
        dist_total = len(dist_trainees)
        dist_employed = sum(1 for t in dist_trainees if t.current_status in ["employed", "self-employed", "apprentice"])
        
        # Calculate avg wage for district
        dist_t_ids = [t.id for t in dist_trainees]
        dist_cps = [cp for cp in checkpoints if cp.trainee_id in dist_t_ids and cp.wage]
        dist_avg_wage = round(sum(cp.wage for cp in dist_cps) / max(len(dist_cps), 1), 0) if dist_cps else 0.0

        district_breakdown.append({
            "district": dist,
            "total_trainees": dist_total,
            "employed_count": dist_employed,
            "unemployed_count": dist_total - dist_employed,
            "placement_rate": round((dist_employed / max(dist_total, 1)) * 100, 1),
            "average_wage": dist_avg_wage
        })

    # 4. Outcome Breakdown by Course
    courses = db.query(Course).all()
    course_breakdown = []
    for c in courses:
        c_trainees = [t for t in trainees if t.course_id == c.id]
        c_total = len(c_trainees)
        c_employed = sum(1 for t in c_trainees if t.current_status in ["employed", "self-employed", "apprentice"])

        c_t_ids = [t.id for t in c_trainees]
        c_cps = [cp for cp in checkpoints if cp.trainee_id in c_t_ids and cp.wage]
        c_avg_wage = round(sum(cp.wage for cp in c_cps) / max(len(c_cps), 1), 0) if c_cps else 0.0

        course_breakdown.append({
            "course_id": c.id,
            "course_name": c.name,
            "total_trainees": c_total,
            "employed_count": c_employed,
            "unemployed_count": c_total - c_employed,
            "placement_rate": round((c_employed / max(c_total, 1)) * 100, 1),
            "average_wage": c_avg_wage
        })

    return {
        "total_trainees": total_trainees,
        "overall_employment_rate": overall_employment_rate,
        "status_split": status_split,
        "longitudinal_progression": longitudinal_progression,
        "district_breakdown": district_breakdown,
        "course_breakdown": course_breakdown,
        "baseline_wage_3m": longitudinal_progression[0]["average_wage"] if longitudinal_progression else 0,
        "current_avg_wage_12m": longitudinal_progression[-1]["average_wage"] if longitudinal_progression else 0,
        "wage_growth_rate": round(
            ((longitudinal_progression[-1]["average_wage"] - longitudinal_progression[0]["average_wage"]) /
             max(longitudinal_progression[0]["average_wage"], 1)) * 100, 1
        ) if longitudinal_progression and longitudinal_progression[0]["average_wage"] > 0 else 0.0
    }


@router.get("/verification-quality")
def get_verification_quality(db: Session = Depends(get_db)):
    """
    FEATURE 3: Verified vs Reported Outcome Confidence Breakdown.
    Measures audit integrity: Verified vs Pending vs Disputed.
    """
    vrs = db.query(VerificationRequest).all()
    total_requests = len(vrs)

    verified_count = sum(1 for v in vrs if v.status == "verified")
    pending_count = sum(1 for v in vrs if v.status == "pending")
    disputed_count = sum(1 for v in vrs if v.status == "disputed")

    verified_pct = round((verified_count / max(total_requests, 1)) * 100, 1)
    pending_pct = round((pending_count / max(total_requests, 1)) * 100, 1)
    disputed_pct = round((disputed_count / max(total_requests, 1)) * 100, 1)

    # Confidence Quality Score: (Verified / (Verified + Disputed)) * 100
    resolved_total = verified_count + disputed_count
    confidence_index = round((verified_count / max(resolved_total, 1)) * 100, 1) if resolved_total > 0 else verified_pct

    return {
        "total_verification_requests": total_requests,
        "verified_count": verified_count,
        "pending_count": pending_count,
        "disputed_count": disputed_count,
        "verified_percentage": verified_pct,
        "pending_percentage": pending_pct,
        "disputed_percentage": disputed_pct,
        "confidence_index": confidence_index,
        "confidence_grade": "High Assurance (Grade A)" if confidence_index >= 80 else ("Moderate Assurance" if confidence_index >= 60 else "Requires Audit"),
        "methodology": "3-Tier Verification: Self-reported → Employer 1-Tap Cryptographic Verification → Dispute Reconciliation"
    }


@router.get("/skill-gaps")
def get_skill_gaps(db: Session = Depends(get_db)):
    """
    FEATURE 3: Real scikit-learn TF-IDF Vectorizer + Cosine Similarity computation.
    Evaluates curriculum alignment against industry employer demand.
    """
    courses = db.query(Course).all()
    courses_data = []

    for c in courses:
        demand = db.query(EmployerDemand).filter(EmployerDemand.course_id == c.id).first()
        courses_data.append({
            "id": c.id,
            "name": c.name,
            "skills_taught": c.skills_taught,
            "skills_demanded": demand.skills_demanded if demand else []
        })

    results = compute_skill_gap_analysis(courses_data)

    flagged_count = sum(1 for r in results if r["is_flagged"])

    return {
        "algorithm": "scikit-learn TfidfVectorizer(ngram_range=(1,2)) + cosine_similarity",
        "threshold_percentage": 50.0,
        "total_courses_analyzed": len(results),
        "flagged_courses_count": flagged_count,
        "courses": results,
        "explanation": "Courses below 50% keyword similarity indicate substantial skill deficits requiring urgent syllabus modernization."
    }


@router.get("/attrition-risk")
def get_attrition_risk(db: Session = Depends(get_db)):
    """
    FEATURE 3: Real scikit-learn Logistic Regression Attrition Risk Predictor.
    Evaluates wage trajectory, employment continuity, district, and course to calculate risk probabilities.
    Includes mandatory ethical decision-support disclaimer.
    """
    trainees = db.query(Trainee).all()
    trainee_records = []

    for t in trainees:
        checkpoints = sorted(t.checkpoints, key=lambda c: c.month_mark)
        latest_cp = checkpoints[-1] if checkpoints else None

        trainee_records.append({
            "trainee_id": t.id,
            "name": t.name,
            "district": t.district,
            "course_name": t.course.name if t.course else "General",
            "current_status": t.current_status,
            "wage": latest_cp.wage if (latest_cp and latest_cp.wage) else 0.0,
            "month_mark": latest_cp.month_mark if latest_cp else 3,
            "same_employer": 1 if (latest_cp and latest_cp.same_employer) else 0
        })

    risk_predictions = attrition_model.predict_trainee_risk(trainee_records)

    high_risk_count = sum(1 for r in risk_predictions if r["risk_level"] == "High")
    med_risk_count = sum(1 for r in risk_predictions if r["risk_level"] == "Medium")
    low_risk_count = sum(1 for r in risk_predictions if r["risk_level"] == "Low")

    return {
        "model": "scikit-learn LogisticRegression (OneHotEncoder + StandardScaler/passthrough)",
        "mandatory_disclaimer": "Risk signal, not a certainty. Provided strictly for decision-support and proactive counseling.",
        "summary": {
            "total_evaluated": len(risk_predictions),
            "high_risk_count": high_risk_count,
            "medium_risk_count": med_risk_count,
            "low_risk_count": low_risk_count,
        },
        "predictions": risk_predictions
    }


@router.get("/outbound-messages")
def get_outbound_messages(limit: int = 50, db: Session = Depends(get_db)):
    """
    Communication & Follow-up Engine simulated outbound message log.
    Shows what WOULD have been sent across WhatsApp, SMS, and Email.
    """
    messages = (
        db.query(OutboundMessage, Trainee)
        .join(Trainee, OutboundMessage.trainee_id == Trainee.id)
        .order_by(OutboundMessage.sent_at.desc())
        .limit(limit)
        .all()
    )

    results = []
    for msg, tr in messages:
        results.append({
            "id": msg.id,
            "trainee_id": tr.id,
            "trainee_name": tr.name,
            "district": tr.district,
            "channel": msg.channel,
            "message_text": msg.message_text,
            "sent_at": msg.sent_at.isoformat() if msg.sent_at else None
        })

    return {
        "engine": "PragatiPath Communication & Follow-up Engine (Simulated Prototype Log)",
        "total_messages_logged": len(results),
        "messages": results
    }
