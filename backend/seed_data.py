import uuid
from datetime import datetime, timedelta
from database import Session
from database import engine, SessionLocal, Base
from models.models import Citizen, Official, Complaint, Upvote, DevelopmentProject
from services.ai_engine import calculate_stars_rating

def seed_db():
    # Recreate tables (or ensure they exist)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already have seeded data
    if db.query(Official).first() is not None:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding database...")

    # 1. Seed Officials
    officials = [
        Official(
            id=str(uuid.uuid4()),
            name="Suresh K.",
            role="MLA",
            jurisdiction="Ward 7, Ward 8, Ward 11",
            phone="9876543210",
            email="mla@vanta.gov.in",
            avg_response_time=8.9,
            resolution_rate=32.1,
            complaints_assigned=25,
            complaints_resolved=8,
            accountability_score=41  # Prominent Suresh K. score
        ),
        Official(
            id=str(uuid.uuid4()),
            name="Ramesh J.",
            role="MLA",
            jurisdiction="Ward 3, Ward 4, Ward 5",
            phone="9876543211",
            email="ramesh@vanta.gov.in",
            avg_response_time=1.2,
            resolution_rate=88.2,
            complaints_assigned=34,
            complaints_resolved=30,
            accountability_score=94
        ),
        Official(
            id=str(uuid.uuid4()),
            name="Priya M.",
            role="MLA",
            jurisdiction="Ward 9, Ward 10, Ward 12",
            phone="9876543212",
            email="priya@vanta.gov.in",
            avg_response_time=3.4,
            resolution_rate=64.5,
            complaints_assigned=19,
            complaints_resolved=12,
            accountability_score=76
        ),
        Official(
            id=str(uuid.uuid4()),
            name="District Collector",
            role="COLLECTOR",
            jurisdiction="Bengaluru South District",
            phone="9876543213",
            email="collector@vanta.gov.in",
            avg_response_time=4.5,
            resolution_rate=75.0,
            complaints_assigned=12,
            complaints_resolved=9,
            accountability_score=85
        ),
        Official(
            id=str(uuid.uuid4()),
            name="Tejasvi S.",
            role="MP",
            jurisdiction="Bengaluru South Constituency",
            phone="9876543214",
            email="mp@vanta.gov.in",
            avg_response_time=5.2,
            resolution_rate=70.0,
            complaints_assigned=8,
            complaints_resolved=6,
            accountability_score=80
        ),
        Official(
            id=str(uuid.uuid4()),
            name="State Ministry",
            role="MINISTRY",
            jurisdiction="Karnataka State Housing & Infrastructure",
            phone="9876543215",
            email="ministry@vanta.gov.in",
            avg_response_time=2.0,
            resolution_rate=90.0,
            complaints_assigned=5,
            complaints_resolved=4,
            accountability_score=90
        )
    ]
    
    for o in officials:
        db.add(o)
    db.commit()
    
    # 2. Seed Citizens
    citizens = [
        Citizen(
            id=str(uuid.uuid4()),
            phone=f"+91990000000{i}",
            name=f"Citizen User {i}",
            ward=f"Ward {7 + (i % 6)}",
            district="Bengaluru South",
            location_lat=12.9716 + (i * 0.005),
            location_lng=77.5946 - (i * 0.005),
            reward_points=10 * i
        )
        for i in range(10)
    ]
    for c in citizens:
        db.add(c)
    db.commit()

    # 2.5 Seed Contractors
    from models.models import Contractor
    contractors = [
        Contractor(id=str(uuid.uuid4()), company_name="VoltMax Power Solutions", specialty="Electrical", rating=4.8, is_government_approved=True),
        Contractor(id=str(uuid.uuid4()), company_name="Bengaluru Grid Co.", specialty="Electrical", rating=4.2, is_government_approved=True),
        Contractor(id=str(uuid.uuid4()), company_name="South City Electrics", specialty="Electrical", rating=3.9, is_government_approved=True),
        Contractor(id=str(uuid.uuid4()), company_name="Apex Wiring & Cables", specialty="Electrical", rating=4.5, is_government_approved=True),
        Contractor(id=str(uuid.uuid4()), company_name="National Power Infra", specialty="Electrical", rating=4.9, is_government_approved=True),
        Contractor(id=str(uuid.uuid4()), company_name="Rapid Roads Ltd.", specialty="Roads", rating=4.7, is_government_approved=True),
        Contractor(id=str(uuid.uuid4()), company_name="ClearWater Systems", specialty="Water", rating=4.4, is_government_approved=True),
    ]
    for c in contractors:
        db.add(c)
    db.commit()

    # 3. Seed complaints
    categories = ["Water", "Roads", "Electrical", "Sanitation", "Health", "Education", "Infrastructure"]
    criticalities = [
        ("ROUTINE", 15),
        ("MODERATE", 35),
        ("ELEVATED", 55),
        ("HIGH", 75),
        ("CRITICAL", 85),
        ("CATASTROPHIC", 98)
    ]
    statuses = ["FILED", "ASSIGNED", "VIEWED", "IN_PROGRESS", "PENDING_VERIFICATION", "RESOLVED"]
    
    # We want a mix of 50 complaints
    mla_suresh = officials[0]
    mla_ramesh = officials[1]
    collector = officials[3]
    mp = officials[4]
    
    # Seed 5 major ones for demo tracking
    complaints = [
        Complaint(
            id=str(uuid.uuid4()),
            citizen_id=citizens[0].id,
            text_content="Ward 7 mein paani nahi aa raha 22 dino se. Bacche pareshan hain.",
            text_original="Ward 7 mein paani nahi aa raha 22 dino se. Bacche pareshan hain.",
            language_detected="hi",
            location_lat=12.9716,
            location_lng=77.5946,
            location_address="Sector 4 Junction, Ward 7",
            ward="Ward 7",
            district="Bengaluru South",
            category="Water",
            sub_category="Water Line Burst",
            criticality_level="CRITICAL",
            criticality_score=74,
            star_rating=5,
            upvote_count=312,
            assigned_to=mla_suresh.id,
            assigned_tier=1,
            status="ASSIGNED",
            deadline_at=datetime.utcnow() - timedelta(days=7), # Overdue
            filed_at=datetime.utcnow() - timedelta(days=22),
            assigned_at=datetime.utcnow() - timedelta(days=22),
            is_overdue=True,
            near_school=True
        ),
        Complaint(
            id=str(uuid.uuid4()),
            citizen_id=citizens[1].id,
            text_content="Road link near primary healthcare facility Ward 9 has massive sinkholes.",
            text_original="Road link near primary healthcare facility Ward 9 has massive sinkholes.",
            language_detected="en",
            location_lat=12.9650,
            location_lng=77.5900,
            location_address="Market Arterial, Ward 9",
            ward="Ward 9",
            district="Bengaluru South",
            category="Roads",
            sub_category="Sinkholes",
            criticality_level="HIGH",
            criticality_score=78,
            star_rating=4,
            upvote_count=142,
            assigned_to=mla_suresh.id,
            assigned_tier=1,
            status="ESCALATED",
            deadline_at=datetime.utcnow() - timedelta(days=3), # Overdue
            filed_at=datetime.utcnow() - timedelta(days=5),
            assigned_at=datetime.utcnow() - timedelta(days=5),
            is_overdue=True
        ),
        Complaint(
            id=str(uuid.uuid4()),
            citizen_id=citizens[2].id,
            text_content="Severe water contamination, drinking water smelling of chemicals near Ward 7 primary school.",
            text_original="Severe water contamination, drinking water smelling of chemicals.",
            language_detected="en",
            location_lat=12.9750,
            location_lng=77.6000,
            location_address="Primary School Road, Ward 7",
            ward="Ward 7",
            district="Bengaluru South",
            category="Water",
            sub_category="Contaminated Water Supply",
            criticality_level="CATASTROPHIC",
            criticality_score=96,
            star_rating=5,
            upvote_count=634,
            assigned_to=officials[5].id, # Ministry
            assigned_tier=4,
            status="PENDING_VERIFICATION",
            filed_at=datetime.utcnow() - timedelta(days=3),
            assigned_at=datetime.utcnow() - timedelta(days=3),
            deadline_at=datetime.utcnow() + timedelta(hours=1),
            resolution_status="PENDING",
            resolution_note="Compromised pipeline cut off, temporary tankers supplied, water filters refitted.",
            resolution_action="TEMP_FIX",
            amount_spent=250000.0,
            fund_used="Emergency Fund",
            is_temp_fix=True,
            near_school=True
        )
    ]
    
    # Generate 47 other complaints
    for i in range(47):
        cat = categories[i % len(categories)]
        crit_name, crit_score = criticalities[i % len(criticalities)]
        stat = statuses[i % len(statuses)]
        ward = f"Ward {7 + (i % 6)}"
        
        # assign based on status/criticality
        assigned_o = mla_ramesh
        tier = 1
        if i % 3 == 0:
            assigned_o = mla_suresh
        elif i % 5 == 0:
            assigned_o = collector
            tier = 2
        elif i % 7 == 0:
            assigned_o = mp
            tier = 3
            
        c = Complaint(
            id=str(uuid.uuid4()),
            citizen_id=citizens[i % len(citizens)].id,
            text_content=f"Reported issue with {cat} in {ward}.",
            text_original=f"Reported issue with {cat} in {ward}.",
            language_detected="en",
            location_lat=12.9716 + ((i - 20) * 0.003),
            location_lng=77.5946 + ((i - 20) * 0.002),
            location_address=f"Location {i}, {ward}",
            ward=ward,
            district="Bengaluru South",
            category=cat,
            sub_category=f"General {cat} Issue",
            criticality_level=crit_name,
            criticality_score=crit_score,
            star_rating=calculate_stars_rating(crit_score),
            upvote_count=i * 5,
            assigned_to=assigned_o.id,
            assigned_tier=tier,
            status=stat,
            filed_at=datetime.utcnow() - timedelta(days=i),
            assigned_at=datetime.utcnow() - timedelta(days=i),
            deadline_at=datetime.utcnow() - timedelta(days=i) + timedelta(days=15),
            is_overdue=stat not in ["RESOLVED", "ARCHIVED"] and i > 15
        )
        complaints.append(c)
        
    for c in complaints:
        db.add(c)
    db.commit()

    # 4. Seed development projects (for MP ranker)
    projects = [
        DevelopmentProject(
            id=str(uuid.uuid4()),
            title="Build Water Pipeline Network",
            category="Water",
            ward="Ward 7",
            complaint_count=634,
            population_affected=18500,
            star_avg=4.8,
            criticality_max="CRITICAL",
            budget_estimate=12000000.0,
            scheme_eligible=["Jal Jeevan Mission", "MPLADS"],
            ai_recommendation="Analysis of 634 individual complaints indicates severe structural failure of the legacy water distribution network in Ward 7. The frequency of 'dry tap' reports has escalated by 300% during summer months. Building a new 12km pipeline network is highly recommended.",
            rank=1
        ),
        DevelopmentProject(
            id=str(uuid.uuid4()),
            title="Primary Healthcare Center Upgrade",
            category="Health",
            ward="Ward 12",
            complaint_count=142,
            population_affected=9200,
            star_avg=4.2,
            criticality_max="HIGH",
            budget_estimate=4500000.0,
            scheme_eligible=["NHM (National Health Mission)", "MPLADS"],
            ai_recommendation="Data indicates a 40% surge in mosquito-borne illness complaints in Ward 12. Cross-referencing with local health data shows the local PHC is under-equipped. Upgrading this facility will address 142 related health complaints.",
            rank=2
        )
    ]
    for p in projects:
        db.add(p)
        
    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()
