from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Course, EmployerDemand

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("")
def list_courses(db: Session = Depends(get_db)):
    """
    List all courses with their curriculum skills taught and industry employer demand skills.
    """
    courses = db.query(Course).all()
    results = []

    for c in courses:
        demand = db.query(EmployerDemand).filter(EmployerDemand.course_id == c.id).first()
        results.append({
            "id": c.id,
            "name": c.name,
            "skills_taught": c.skills_taught,
            "skills_demanded": demand.skills_demanded if demand else []
        })

    return results
