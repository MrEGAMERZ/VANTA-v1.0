import uuid
from database import Base, Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, relationship, func

class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    ward = Column(String, nullable=True)
    district = Column(String, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    reward_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    complaints = relationship("Complaint", back_populates="citizen")
    upvotes = relationship("Upvote", back_populates="citizen")

class Official(Base):
    __tablename__ = "officials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    role = Column(String)  # MLA/COLLECTOR/MP/MINISTRY
    jurisdiction = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, default="password")
    avg_response_time = Column(Float, default=0.0)
    resolution_rate = Column(Float, default=0.0)
    complaints_assigned = Column(Integer, default=0)
    complaints_resolved = Column(Integer, default=0)
    accountability_score = Column(Integer, default=100)
    created_at = Column(DateTime, default=func.now())

    complaints = relationship("Complaint", back_populates="assigned_official")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String, ForeignKey("citizens.id"), nullable=True)
    text_content = Column(Text, nullable=True)
    text_original = Column(Text, nullable=True)
    language_detected = Column(String, nullable=True)
    voice_file_url = Column(String, nullable=True)
    photo_urls = Column(JSON, default=list)  # SQLite compatible list storing URLs
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_address = Column(Text, nullable=True)
    ward = Column(String, nullable=True)
    district = Column(String, nullable=True)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    criticality_level = Column(String, default="ROUTINE")  # ROUTINE/MODERATE/ELEVATED/HIGH/CRITICAL/CATASTROPHIC
    criticality_score = Column(Integer, default=0)
    star_rating = Column(Integer, default=1)  # 1 to 5
    upvote_count = Column(Integer, default=0)
    assigned_to = Column(String, ForeignKey("officials.id"), nullable=True)
    assigned_tier = Column(Integer, default=1)  # 1/2/3/4
    status = Column(String, default="FILED")  # FILED/ASSIGNED/VIEWED/IN_PROGRESS/ESCALATED/PENDING_VERIFICATION/RESOLVED/ARCHIVED
    is_duplicate_of = Column(String, nullable=True)
    duplicate_count = Column(Integer, default=0)
    
    filed_at = Column(DateTime, default=func.now())
    assigned_at = Column(DateTime, nullable=True)
    first_viewed_at = Column(DateTime, nullable=True)
    first_response_at = Column(DateTime, nullable=True)
    deadline_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    archive_at = Column(DateTime, nullable=True)
    escalation_count = Column(Integer, default=0)
    is_overdue = Column(Boolean, default=False)
    
    near_school = Column(Boolean, default=False)
    near_hospital = Column(Boolean, default=False)
    near_highway = Column(Boolean, default=False)
    flood_prone_zone = Column(Boolean, default=False)
    near_dam = Column(Boolean, default=False)
    ai_photo_analysis = Column(JSON, nullable=True)
    is_fake_flagged = Column(Boolean, default=False)
    risk_flags = Column(JSON, default=list)
    
    # Resolution fields
    resolution_status = Column(String, nullable=True)  # PENDING/TEMP_FIX/VERIFIED/FALSE_CLOSURE
    resolution_note = Column(Text, nullable=True)
    resolution_photos = Column(JSON, default=list)
    resolution_action = Column(String, nullable=True)  # REPAIRED/REPLACED/NEW/TEMP_FIX
    fund_used = Column(String, nullable=True)
    amount_spent = Column(Float, default=0.0)
    verification_yes = Column(Integer, default=0)
    verification_no = Column(Integer, default=0)
    is_temp_fix = Column(Boolean, default=False)
    temp_fix_deadline = Column(DateTime, nullable=True)

    citizen = relationship("Citizen", back_populates="complaints")
    assigned_official = relationship("Official", back_populates="complaints")
    upvote_details = relationship("Upvote", back_populates="complaint")

class Upvote(Base):
    __tablename__ = "upvotes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String, ForeignKey("complaints.id"))
    citizen_id = Column(String, ForeignKey("citizens.id"))
    filed_at = Column(DateTime, default=func.now())

    complaint = relationship("Complaint", back_populates="upvote_details")
    citizen = relationship("Citizen", back_populates="upvotes")

class EscalationLog(Base):
    __tablename__ = "escalation_log"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String, ForeignKey("complaints.id"))
    from_tier = Column(Integer)
    to_tier = Column(Integer)
    from_official_id = Column(String, ForeignKey("officials.id"), nullable=True)
    to_official_id = Column(String, ForeignKey("officials.id"), nullable=True)
    reason = Column(Text, nullable=True)
    escalated_at = Column(DateTime, default=func.now())

class VerificationLog(Base):
    __tablename__ = "verification_log"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String, ForeignKey("complaints.id"))
    citizen_id = Column(String, ForeignKey("citizens.id"))
    vote = Column(Boolean)  # True = fixed, False = not fixed
    voted_at = Column(DateTime, default=func.now())

class DevelopmentProject(Base):
    __tablename__ = "development_projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    category = Column(String)
    ward = Column(String)
    complaint_count = Column(Integer, default=0)
    population_affected = Column(Integer, default=0)
    star_avg = Column(Float, default=0.0)
    criticality_max = Column(String)
    budget_estimate = Column(Float, default=0.0)
    scheme_eligible = Column(JSON, default=list)
    ai_recommendation = Column(Text, nullable=True)
    data_evidence = Column(JSON, nullable=True)
    rank = Column(Integer)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    ledgers = relationship("TransparencyLedger", back_populates="project")

class TransparencyLedger(Base):
    """
    Transparency Engine Model: Tracks public procurement, bids, milestone completions, 
    and phase-wise payments for Development Projects.
    """
    __tablename__ = "transparency_ledgers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("development_projects.id"))
    contractor_name = Column(String)
    bid_amount = Column(Float)
    funds_released = Column(Float, default=0.0)
    milestone_status = Column(String, default="CONTRACT_AWARDED") # CONTRACT_AWARDED, PHASE_1, PHASE_2, COMPLETED
    phase_wise_payments = Column(JSON, default=list) # Array of payment dicts
    last_updated = Column(DateTime, default=func.now())

    project = relationship("DevelopmentProject", back_populates="ledgers")
