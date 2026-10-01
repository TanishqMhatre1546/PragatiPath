from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    skills_taught_raw = Column("skills_taught", Text, nullable=False, default="[]")

    @property
    def skills_taught(self):
        try:
            return json.loads(self.skills_taught_raw)
        except Exception:
            return []

    @skills_taught.setter
    def skills_taught(self, value):
        self.skills_taught_raw = json.dumps(value)

    trainees = relationship("Trainee", back_populates="course")
    demands = relationship("EmployerDemand", back_populates="course")


class EmployerDemand(Base):
    __tablename__ = "employer_demands"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    skills_demanded_raw = Column("skills_demanded", Text, nullable=False, default="[]")

    @property
    def skills_demanded(self):
        try:
            return json.loads(self.skills_demanded_raw)
        except Exception:
            return []

    @skills_demanded.setter
    def skills_demanded(self, value):
        self.skills_demanded_raw = json.dumps(value)

    course = relationship("Course", back_populates="demands")


class Trainee(Base):
    __tablename__ = "trainees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrollment_date = Column(String(50), nullable=False)
    current_status = Column(String(50), nullable=False, default="unemployed")  # employed/self-employed/apprentice/unemployed

    course = relationship("Course", back_populates="trainees")
    checkpoints = relationship("Checkpoint", back_populates="trainee", order_by="Checkpoint.month_mark")
    verification_requests = relationship("VerificationRequest", back_populates="trainee")
    outbound_messages = relationship("OutboundMessage", back_populates="trainee", order_by="desc(OutboundMessage.sent_at)")


class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id = Column(Integer, primary_key=True, index=True)
    trainee_id = Column(Integer, ForeignKey("trainees.id"), nullable=False)
    month_mark = Column(Integer, nullable=False)  # 3, 6, 12
    status = Column(String(50), nullable=False)  # employed/self-employed/apprentice/unemployed
    employer_name = Column(String(150), nullable=True)
    wage = Column(Float, nullable=True)
    same_employer = Column(Boolean, nullable=True, default=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    trainee = relationship("Trainee", back_populates="checkpoints")
    verification_request = relationship("VerificationRequest", back_populates="checkpoint", uselist=False)


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    trainee_id = Column(Integer, ForeignKey("trainees.id"), nullable=False)
    checkpoint_id = Column(Integer, ForeignKey("checkpoints.id"), nullable=False)
    employer_name = Column(String(150), nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending/verified/disputed
    requested_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    trainee = relationship("Trainee", back_populates="verification_requests")
    checkpoint = relationship("Checkpoint", back_populates="verification_request")


class OutboundMessage(Base):
    __tablename__ = "outbound_messages"

    id = Column(Integer, primary_key=True, index=True)
    trainee_id = Column(Integer, ForeignKey("trainees.id"), nullable=False)
    channel = Column(String(50), nullable=False)  # whatsapp/sms/email
    message_text = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    trainee = relationship("Trainee", back_populates="outbound_messages")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # trainee/employer/government
    email = Column(String(100), nullable=False)
    full_name = Column(String(100), nullable=False)
