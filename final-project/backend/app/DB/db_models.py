import enum
from sqlalchemy import Column, Integer, String, Float, Enum, BigInteger, CheckConstraint
from app.DB.database import Base 

class ToxicityCategory(str, enum.Enum):
    LGBTQ = "lgbtq"
    APPEARANCE_AND_WEIGHT = "appearance_and_weight"
    RELIGIOUS_DISCRIMINATION = "religious_discrimination"
    GENERAL = "general"

class Toxic_Comment(Base):
    __tablename__ = "toxic_comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(500), nullable=False) 
    category = Column(Enum(ToxicityCategory), nullable=False) 
    score = Column(Float, nullable=False)

class System_Stat(Base):
    __tablename__ = "system_stats"

    # We force the ID to always be 1 to ensure only one row exists
    id = Column(Integer, primary_key=True, server_default="1")
    
    # Your counters
    total_comments = Column(BigInteger, default=0)
    total_toxic_comments = Column(BigInteger, default=0)
    community_members = Column(BigInteger, default=0)
    total_reports = Column(BigInteger, default=0)

    # Database-level guardrail: ensures id cannot be anything other than 1
    __table_args__ = (
        CheckConstraint('id = 1', name='only_one_row'),
    )