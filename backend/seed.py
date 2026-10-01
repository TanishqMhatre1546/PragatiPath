from datetime import datetime, timedelta
import random
from database import SessionLocal, Base, engine
from models import Course, EmployerDemand, Trainee, Checkpoint, VerificationRequest, OutboundMessage, User
from ml_models import attrition_model
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_database(force=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        course_count = db.query(Course).count()
        if course_count > 0 and not force:
            logger.info("Database already contains data. Skipping seeding.")
            train_ml_on_existing_data(db)
            return

        if force:
            logger.info("Force resetting database...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        logger.info("Seeding PragatiPath database with authentic SIH demo data...")

        # 1. Seed Demo Users
        users = [
            User(username="trainee_demo", role="trainee", email="rohan.patil@example.com", full_name="Rohan Patil (Trainee)"),
            User(username="employer_demo", role="employer", email="hr@tatamotors.pune.com", full_name="Tata Motors HR Pune (Employer)"),
            User(username="govt_demo", role="government", email="director.skilling@maharashtra.gov.in", full_name="Dr. Anil Deshmukh (Govt Official)"),
        ]
        db.add_all(users)
        db.commit()

        # 2. Seed 4 Courses with Skills Taught and Employer Demands
        courses_data = [
            {
                "name": "Electrician & Power Systems",
                "skills_taught": [
                    "Domestic House Wiring",
                    "AC and DC Circuit Analysis",
                    "Single Phase Induction Motor",
                    "Earthing and Grounding Techniques",
                    "Industrial Safety Protocols",
                    "Multimeter and Megger Diagnostics"
                ],
                "skills_demanded": [
                    "Domestic House Wiring",
                    "Industrial Safety Protocols",
                    "Earthing and Grounding Techniques",
                    "Industrial PLC Automation",
                    "Three Phase Induction Motor",
                    "High Voltage Substation Maintenance",
                    "Solar Rooftop Inverter Wiring"
                ]
            },
            {
                "name": "Industrial Apparel & Tailoring",
                "skills_taught": [
                    "Garment Construction Techniques",
                    "Industrial Pattern Making",
                    "Fabric Cutting and Sorting",
                    "Single Needle Sewing Machine Operation",
                    "Hemming and Edge Finishing",
                    "Body Measurement and Drafting"
                ],
                "skills_demanded": [
                    "Garment Construction Techniques",
                    "Industrial Pattern Making",
                    "Fabric Cutting and Sorting",
                    "Single Needle Sewing Machine Operation",
                    "Hemming and Edge Finishing",
                    "CAD Apparel Pattern Design",
                    "Export Quality Inspection"
                ]
            },
            {
                "name": "Data Entry & Office Automation",
                "skills_taught": [
                    "Basic Computer Operation Fundamentals",
                    "MS Word Document Formatting",
                    "Typing Speed Hindi and English 25WPM",
                    "Local File Management",
                    "Basic Scanner and Printer Operation"
                ],
                "skills_demanded": [
                    "Advanced Excel Formulas and VLOOKUP",
                    "Tally Prime ERP Accounting",
                    "Data Sanitization and Cleaning",
                    "SQL Data Extraction Basics",
                    "Google Workspace Collaboration",
                    "Power BI Dashboard Reporting",
                    "Typing Speed English 40WPM"
                ]
            },
            {
                "name": "Shielded Metal Arc & Gas Welding",
                "skills_taught": [
                    "Shielded Metal Arc Welding (SMAW)",
                    "Oxy-Acetylene Torch Cutting",
                    "Weld Joint Edge Preparation",
                    "Workshop Safety and PPE Guidelines",
                    "Visual Weld Defect Inspection"
                ],
                "skills_demanded": [
                    "Shielded Metal Arc Welding (SMAW)",
                    "Workshop Safety and PPE Guidelines",
                    "TIG Argon Gas Welding",
                    "MIG/MAG Semi-Automatic Welding",
                    "Pipe 6G High Pressure Welding",
                    "NDT Ultrasonic Testing Inspection",
                    "Engineering Blueprint Reading"
                ]
            }
        ]

        course_objs = {}
        for c in courses_data:
            course = Course(name=c["name"])
            course.skills_taught = c["skills_taught"]
            db.add(course)
            db.flush()

            demand = EmployerDemand(course_id=course.id)
            demand.skills_demanded = c["skills_demanded"]
            db.add(demand)
            db.flush()

            course_objs[c["name"]] = course

        db.commit()

        # 3. Seed 28 Trainees with realistic trajectories
        districts = ["Pune", "Nashik", "Nagpur"]
        
        trainee_roster = [
            # Electrician trainees (Pune, Nashik, Nagpur)
            ("Rohan Patil", "Pune", "Electrician & Power Systems", "2025-01-10", "employed"),
            ("Aarav Sharma", "Pune", "Electrician & Power Systems", "2025-01-10", "employed"),
            ("Sunil Shinde", "Nashik", "Electrician & Power Systems", "2025-02-15", "employed"),
            ("Vikas Jadhav", "Nashik", "Electrician & Power Systems", "2025-02-15", "self-employed"),
            ("Pramod More", "Nagpur", "Electrician & Power Systems", "2025-03-01", "employed"),
            ("Ganesh Ghate", "Nagpur", "Electrician & Power Systems", "2025-03-01", "unemployed"),
            ("Rahul Kulkarni", "Pune", "Electrician & Power Systems", "2025-04-10", "apprentice"),

            # Tailoring trainees
            ("Pooja Deshmukh", "Pune", "Industrial Apparel & Tailoring", "2025-01-15", "employed"),
            ("Sneha Kulkarni", "Pune", "Industrial Apparel & Tailoring", "2025-01-15", "employed"),
            ("Anjali Gaikwad", "Nashik", "Industrial Apparel & Tailoring", "2025-02-10", "employed"),
            ("Kavita Sawant", "Nashik", "Industrial Apparel & Tailoring", "2025-02-10", "self-employed"),
            ("Pallavi Thorat", "Nagpur", "Industrial Apparel & Tailoring", "2025-03-05", "employed"),
            ("Shital Sonawane", "Nagpur", "Industrial Apparel & Tailoring", "2025-03-05", "employed"),
            ("Meera Joshi", "Pune", "Industrial Apparel & Tailoring", "2025-04-01", "apprentice"),

            # Data Entry trainees (High skill gap flags / attrition)
            ("Nikhil Mane", "Pune", "Data Entry & Office Automation", "2025-01-05", "employed"),
            ("Kiran Bhise", "Pune", "Data Entry & Office Automation", "2025-01-05", "unemployed"),
            ("Tejas Wagh", "Nashik", "Data Entry & Office Automation", "2025-02-20", "unemployed"),
            ("Pratiksha Kale", "Nashik", "Data Entry & Office Automation", "2025-02-20", "employed"),
            ("Amit Chavan", "Nagpur", "Data Entry & Office Automation", "2025-03-12", "unemployed"),
            ("Sagar Tambe", "Nagpur", "Data Entry & Office Automation", "2025-03-12", "employed"),
            ("Dipali Salve", "Pune", "Data Entry & Office Automation", "2025-04-05", "unemployed"),

            # Welding trainees
            ("Mahesh Pawar", "Pune", "Shielded Metal Arc & Gas Welding", "2025-01-20", "employed"),
            ("Sachin Rathod", "Pune", "Shielded Metal Arc & Gas Welding", "2025-01-20", "employed"),
            ("Akash Jagtap", "Nashik", "Shielded Metal Arc & Gas Welding", "2025-02-12", "employed"),
            ("Deepak Lohar", "Nashik", "Shielded Metal Arc & Gas Welding", "2025-02-12", "unemployed"),
            ("Santosh Gaikar", "Nagpur", "Shielded Metal Arc & Gas Welding", "2025-03-18", "employed"),
            ("Nilesh Borse", "Nagpur", "Shielded Metal Arc & Gas Welding", "2025-03-18", "self-employed"),
            ("Vinod Shelke", "Pune", "Shielded Metal Arc & Gas Welding", "2025-04-15", "employed")
        ]

        employer_pool = {
            "Electrician & Power Systems": ["Tata Motors Ltd Pune", "Mahindra & Mahindra Nashik", "Bajaj Auto Electricals", "MSEB Power Grid Substation"],
            "Industrial Apparel & Tailoring": ["Raymond Garments Nashik", "Shahi Exports Pune", "Gokaldas Apparels Nagpur", "Self-Craft Tailoring Studio"],
            "Data Entry & Office Automation": ["Wipro BPO Operations", "District Collectorate Admin Unit", "TCS e-Governance Center", "Infosys BPM Logistics"],
            "Shielded Metal Arc & Gas Welding": ["Thermax Boilers Pune", "Kirloskar Heavy Engg", "L&T Heavy Fabricators", "Nagpur Metro Infrastructure"]
        }

        now = datetime.utcnow()
        training_rows_for_ml = []

        for name, district, c_name, enr_date, current_status in trainee_roster:
            course = course_objs[c_name]
            t = Trainee(
                name=name,
                district=district,
                course_id=course.id,
                enrollment_date=enr_date,
                current_status=current_status
            )
            db.add(t)
            db.flush()

            # Seed Checkpoints (1 to 3 checkpoints based on enrollment date)
            # Rohan Patil (Trainee Demo) gets 3 completed checkpoints (3m, 6m, 12m)
            is_demo_trainee = (name == "Rohan Patil")
            num_checkpoints = 3 if is_demo_trainee else (
                3 if "2025-01" in enr_date else (
                    2 if "2025-02" in enr_date or "2025-03" in enr_date else 1
                )
            )

            base_wage = 12000 if "Electrician" in c_name else (
                11000 if "Tailoring" in c_name else (
                    9500 if "Data Entry" in c_name else 13000
                )
            )

            primary_employer = random.choice(employer_pool[c_name])

            for cp_idx, month_mark in enumerate([3, 6, 12][:num_checkpoints]):
                is_latest_cp = (cp_idx == num_checkpoints - 1)
                cp_status = current_status if is_latest_cp else "employed"
                
                # Wage increments
                wage = None
                emp_name = None
                same_emp = True
                
                if cp_status in ["employed", "apprentice", "self-employed"]:
                    wage_gain = (month_mark // 3) * random.randint(1200, 2500)
                    wage = base_wage + wage_gain
                    emp_name = primary_employer if cp_status != "self-employed" else f"{name} Enterprise"
                    if cp_idx > 0 and random.random() < 0.2:
                        same_emp = False
                        primary_employer = random.choice(employer_pool[c_name])
                        emp_name = primary_employer

                cp_date = datetime.strptime(enr_date, "%Y-%m-%d") + timedelta(days=month_mark * 30)

                cp = Checkpoint(
                    trainee_id=t.id,
                    month_mark=month_mark,
                    status=cp_status,
                    employer_name=emp_name,
                    wage=wage,
                    same_employer=same_emp,
                    recorded_at=cp_date
                )
                db.add(cp)
                db.flush()

                # For ML training data collection
                training_rows_for_ml.append({
                    "trainee_id": t.id,
                    "name": t.name,
                    "district": t.district,
                    "course_name": c_name,
                    "wage": wage if wage else 0.0,
                    "month_mark": month_mark,
                    "same_employer": 1 if same_emp else 0,
                    "is_unemployed": 1 if cp_status == "unemployed" else 0,
                    "current_status": cp_status
                })

                # Create VerificationRequest for employed/apprentice checkpoints
                if emp_name and cp_status in ["employed", "apprentice"]:
                    # Distribute status: 70% verified, 20% pending, 10% disputed
                    if is_demo_trainee:
                        vr_status = "verified" if month_mark in [3, 6] else "pending"
                    else:
                        rand_val = random.random()
                        if rand_val < 0.65:
                            vr_status = "verified"
                        elif rand_val < 0.85:
                            vr_status = "pending"
                        else:
                            vr_status = "disputed"

                    resolved_at = cp_date + timedelta(days=2) if vr_status != "pending" else None

                    vr = VerificationRequest(
                        trainee_id=t.id,
                        checkpoint_id=cp.id,
                        employer_name=emp_name,
                        status=vr_status,
                        requested_at=cp_date,
                        resolved_at=resolved_at
                    )
                    db.add(vr)

                    # Simulated outbound message log entry
                    msg_text = (
                        f"PragatiPath Verification Alert: Employer {emp_name}, please verify 1-tap outcome "
                        f"for candidate {t.name} (Course: {c_name}, Month {month_mark})."
                    )
                    msg = OutboundMessage(
                        trainee_id=t.id,
                        channel=random.choice(["whatsapp", "sms"]),
                        message_text=msg_text,
                        sent_at=cp_date
                    )
                    db.add(msg)

                    if vr_status == "verified":
                        db.add(OutboundMessage(
                            trainee_id=t.id,
                            channel="whatsapp",
                            message_text=f"Verification Confirmed: {emp_name} has verified your Month-{month_mark} milestone. Great job, {t.name}!",
                            sent_at=cp_date + timedelta(days=2)
                        ))

            # Initial welcome message
            db.add(OutboundMessage(
                trainee_id=t.id,
                channel="whatsapp",
                message_text=f"Namaste {t.name}, welcome to PragatiPath longitudinal tracking for {c_name}. Consent recorded successfully.",
                sent_at=datetime.strptime(enr_date, "%Y-%m-%d")
            ))

        db.commit()
        logger.info(f"Database successfully seeded with {len(trainee_roster)} trainees, checkpoints, verification requests and outbound logs.")

        # Train ML model
        train_ml_on_existing_data(db)

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


def train_ml_on_existing_data(db):
    """
    Extracts all checkpoints from DB and trains the scikit-learn LogisticRegression model.
    """
    checkpoints = (
        db.query(Checkpoint, Trainee, Course)
        .join(Trainee, Checkpoint.trainee_id == Trainee.id)
        .join(Course, Trainee.course_id == Course.id)
        .all()
    )

    training_rows = []
    for cp, tr, co in checkpoints:
        training_rows.append({
            "trainee_id": tr.id,
            "name": tr.name,
            "district": tr.district,
            "course_name": co.name,
            "wage": cp.wage if cp.wage is not None else 0.0,
            "month_mark": cp.month_mark,
            "same_employer": 1 if cp.same_employer else 0,
            "is_unemployed": 1 if cp.status == "unemployed" else 0,
            "current_status": tr.current_status
        })

    if training_rows:
        attrition_model.train(training_rows)
        logger.info(f"Trained AttritionRiskModel on {len(training_rows)} historical checkpoint rows.")


if __name__ == "__main__":
    seed_database(force=True)
