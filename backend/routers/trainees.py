from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Trainee, Checkpoint, VerificationRequest, OutboundMessage, Course
from ml_models import attrition_model
from seed import train_ml_on_existing_data

router = APIRouter(prefix="/trainees", tags=["Trainees"])


class CheckinRequest(BaseModel):
    status: str  # employed/self-employed/apprentice/unemployed
    employer_name: Optional[str] = None
    wage: Optional[float] = None
    same_employer: Optional[bool] = True
    month_mark: Optional[int] = None  # if not provided, auto-increment


@router.get("")
def list_trainees(district: Optional[str] = None, course_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    List all trainees with summary info, latest checkpoint, wage, and current status.
    """
    query = db.query(Trainee)
    if district:
        query = query.filter(Trainee.district == district)
    if course_id:
        query = query.filter(Trainee.course_id == course_id)

    trainees = query.all()
    results = []

    for t in trainees:
        checkpoints = sorted(t.checkpoints, key=lambda c: c.month_mark)
        latest_cp = checkpoints[-1] if checkpoints else None
        latest_wage = latest_cp.wage if (latest_cp and latest_cp.wage) else None
        latest_month = latest_cp.month_mark if latest_cp else 0

        results.append({
            "id": t.id,
            "name": t.name,
            "district": t.district,
            "course_id": t.course_id,
            "course_name": t.course.name if t.course else "Unknown",
            "enrollment_date": t.enrollment_date,
            "current_status": t.current_status,
            "checkpoint_count": len(checkpoints),
            "latest_month_mark": latest_month,
            "latest_wage": latest_wage,
            "latest_employer": latest_cp.employer_name if latest_cp else None
        })

    return results


@router.get("/{trainee_id}")
def get_trainee_details(trainee_id: int, db: Session = Depends(get_db)):
    """
    Get deep longitudinal trajectory for a single trainee with timeline checkpoints,
    wage progression, verification requests, and simulated outbound messages.
    """
    t = db.query(Trainee).filter(Trainee.id == trainee_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trainee not found")

    checkpoints_data = []
    for cp in sorted(t.checkpoints, key=lambda x: x.month_mark):
        vr = cp.verification_request
        vr_data = None
        if vr:
            vr_data = {
                "id": vr.id,
                "status": vr.status,
                "employer_name": vr.employer_name,
                "requested_at": vr.requested_at.isoformat() if vr.requested_at else None,
                "resolved_at": vr.resolved_at.isoformat() if vr.resolved_at else None
            }

        checkpoints_data.append({
            "id": cp.id,
            "month_mark": cp.month_mark,
            "status": cp.status,
            "employer_name": cp.employer_name,
            "wage": cp.wage,
            "same_employer": cp.same_employer,
            "recorded_at": cp.recorded_at.isoformat() if cp.recorded_at else None,
            "verification": vr_data
        })

    # Prepare outbound message history
    messages = [
        {
            "id": m.id,
            "channel": m.channel,
            "message_text": m.message_text,
            "sent_at": m.sent_at.isoformat() if m.sent_at else None
        }
        for m in sorted(t.outbound_messages, key=lambda x: x.sent_at, reverse=True)
    ]

    return {
        "id": t.id,
        "name": t.name,
        "district": t.district,
        "course_id": t.course_id,
        "course_name": t.course.name if t.course else "Unknown",
        "course_skills_taught": t.course.skills_taught if t.course else [],
        "enrollment_date": t.enrollment_date,
        "current_status": t.current_status,
        "checkpoints": checkpoints_data,
        "outbound_messages": messages
    }


@router.post("/{trainee_id}/checkin")
def submit_checkin(trainee_id: int, payload: CheckinRequest, db: Session = Depends(get_db)):
    """
    FEATURE 1: Low-burden check-in endpoint (<15s flow).
    Creates a new Checkpoint, updates current_status, and if employed/self-employed,
    creates a pending VerificationRequest and OutboundMessage for simulated employer follow-up.
    """
    t = db.query(Trainee).filter(Trainee.id == trainee_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trainee not found")

    # Determine next month mark
    existing_marks = [c.month_mark for c in t.checkpoints]
    if payload.month_mark:
        next_month = payload.month_mark
    else:
        if 3 not in existing_marks:
            next_month = 3
        elif 6 not in existing_marks:
            next_month = 6
        elif 12 not in existing_marks:
            next_month = 12
        else:
            # Increment beyond 12 (e.g. 18 months)
            next_month = max(existing_marks) + 6

    now = datetime.utcnow()

    # Create new Checkpoint
    checkpoint = Checkpoint(
        trainee_id=t.id,
        month_mark=next_month,
        status=payload.status,
        employer_name=payload.employer_name,
        wage=payload.wage,
        same_employer=payload.same_employer if payload.same_employer is not None else True,
        recorded_at=now
    )
    db.add(checkpoint)
    db.flush()

    # Update Trainee's current status
    t.current_status = payload.status

    vr_info = None
    # If employed or apprentice or self-employed with employer, create VerificationRequest
    if payload.status in ["employed", "apprentice"] and payload.employer_name:
        vr = VerificationRequest(
            trainee_id=t.id,
            checkpoint_id=checkpoint.id,
            employer_name=payload.employer_name,
            status="pending",
            requested_at=now
        )
        db.add(vr)
        db.flush()
        vr_info = {"id": vr.id, "status": "pending", "employer_name": payload.employer_name}

        # Simulated outbound message to employer
        employer_msg = (
            f"PragatiPath Verification: Requesting 1-tap confirmation of employment for {t.name} "
            f"at {payload.employer_name} (Milestone: Month {next_month}). Reply or tap portal link to confirm."
        )
        db.add(OutboundMessage(
            trainee_id=t.id,
            channel="whatsapp",
            message_text=employer_msg,
            sent_at=now
        ))

    # Candidate acknowledgment message
    candidate_msg = (
        f"PragatiPath Milestone Logged: Thank you {t.name}! Your Month-{next_month} status "
        f"('{payload.status.replace('-', ' ').title()}' - ₹{int(payload.wage or 0)}/mo) has been securely recorded."
    )
    db.add(OutboundMessage(
        trainee_id=t.id,
        channel="whatsapp",
        message_text=candidate_msg,
        sent_at=now
    ))

    db.commit()

    # Retrain ML model in background/sync on new data
    try:
        train_ml_on_existing_data(db)
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Checkpoint for Month {next_month} successfully recorded in <15 seconds.",
        "checkpoint_id": checkpoint.id,
        "month_mark": next_month,
        "status": payload.status,
        "wage": payload.wage,
        "verification_request": vr_info
    }
