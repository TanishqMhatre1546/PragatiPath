from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import VerificationRequest, Trainee, Checkpoint, OutboundMessage, Course

router = APIRouter(prefix="/verifications", tags=["Employer Verifications"])


@router.get("/pending")
def get_pending_verifications(employer_name: Optional[str] = None, db: Session = Depends(get_db)):
    """
    FEATURE 2: Employer One-Tap Verification feed.
    Returns all pending verification requests with joined candidate and milestone details.
    """
    query = (
        db.query(VerificationRequest, Trainee, Checkpoint, Course)
        .join(Trainee, VerificationRequest.trainee_id == Trainee.id)
        .join(Checkpoint, VerificationRequest.checkpoint_id == Checkpoint.id)
        .join(Course, Trainee.course_id == Course.id)
        .filter(VerificationRequest.status == "pending")
    )

    if employer_name:
        query = query.filter(VerificationRequest.employer_name.ilike(f"%{employer_name}%"))

    items = query.order_by(VerificationRequest.requested_at.desc()).all()

    results = []
    for vr, tr, cp, co in items:
        results.append({
            "id": vr.id,
            "trainee_id": tr.id,
            "trainee_name": tr.name,
            "district": tr.district,
            "course_name": co.name,
            "employer_name": vr.employer_name,
            "checkpoint_id": cp.id,
            "month_mark": cp.month_mark,
            "reported_wage": cp.wage,
            "reported_status": cp.status,
            "same_employer": cp.same_employer,
            "requested_at": vr.requested_at.isoformat() if vr.requested_at else None,
            "status": vr.status
        })

    return results


@router.get("")
def get_all_verifications(status: Optional[str] = None, db: Session = Depends(get_db)):
    """
    List all verification records with status filters (pending, verified, disputed).
    """
    query = (
        db.query(VerificationRequest, Trainee, Checkpoint, Course)
        .join(Trainee, VerificationRequest.trainee_id == Trainee.id)
        .join(Checkpoint, VerificationRequest.checkpoint_id == Checkpoint.id)
        .join(Course, Trainee.course_id == Course.id)
    )

    if status:
        query = query.filter(VerificationRequest.status == status)

    items = query.order_by(VerificationRequest.requested_at.desc()).all()

    results = []
    for vr, tr, cp, co in items:
        results.append({
            "id": vr.id,
            "trainee_id": tr.id,
            "trainee_name": tr.name,
            "district": tr.district,
            "course_name": co.name,
            "employer_name": vr.employer_name,
            "checkpoint_id": cp.id,
            "month_mark": cp.month_mark,
            "reported_wage": cp.wage,
            "status": vr.status,
            "requested_at": vr.requested_at.isoformat() if vr.requested_at else None,
            "resolved_at": vr.resolved_at.isoformat() if vr.resolved_at else None
        })

    return results


@router.post("/{verification_id}/confirm")
def confirm_verification(verification_id: int, db: Session = Depends(get_db)):
    """
    FEATURE 2: One-tap Confirm button.
    Marks the verification request as VERIFIED, records timestamp, and emits simulated outbound WhatsApp acknowledgment.
    """
    vr = db.query(VerificationRequest).filter(VerificationRequest.id == verification_id).first()
    if not vr:
        raise HTTPException(status_code=404, detail="Verification request not found")

    now = datetime.utcnow()
    vr.status = "verified"
    vr.resolved_at = now

    trainee = vr.trainee
    checkpoint = vr.checkpoint

    # Simulated outbound message log entry
    msg_text = (
        f"PragatiPath Verification Confirmed: {vr.employer_name} has officially verified "
        f"{trainee.name}'s employment at Month-{checkpoint.month_mark} milestone. Status: VERIFIED."
    )
    db.add(OutboundMessage(
        trainee_id=trainee.id,
        channel="whatsapp",
        message_text=msg_text,
        sent_at=now
    ))

    db.commit()

    return {
        "success": True,
        "message": f"Verification for {trainee.name} successfully confirmed by {vr.employer_name}.",
        "status": "verified",
        "resolved_at": now.isoformat()
    }


@router.post("/{verification_id}/deny")
def deny_verification(verification_id: int, db: Session = Depends(get_db)):
    """
    FEATURE 2: One-tap Deny button.
    Marks the verification request as DISPUTED, records timestamp, and emits simulated outbound alert.
    """
    vr = db.query(VerificationRequest).filter(VerificationRequest.id == verification_id).first()
    if not vr:
        raise HTTPException(status_code=404, detail="Verification request not found")

    now = datetime.utcnow()
    vr.status = "disputed"
    vr.resolved_at = now

    trainee = vr.trainee
    checkpoint = vr.checkpoint

    # Simulated outbound message log entry
    msg_text = (
        f"PragatiPath Dispute Alert: {vr.employer_name} has flagged a discrepancy for "
        f"{trainee.name} (Month-{checkpoint.month_mark}). Flagged for District Officer reconciliation."
    )
    db.add(OutboundMessage(
        trainee_id=trainee.id,
        channel="sms",
        message_text=msg_text,
        sent_at=now
    ))

    db.commit()

    return {
        "success": True,
        "message": f"Verification marked as disputed. Case logged for audit.",
        "status": "disputed",
        "resolved_at": now.isoformat()
    }
