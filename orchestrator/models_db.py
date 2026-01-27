from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

class Target(Base):
    __tablename__ = "targets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    scans = relationship("Scan", back_populates="target")

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    target_id = Column(String, ForeignKey("targets.id"), nullable=True) # Optional for now (backward compatibility)
    scan_type = Column(String, nullable=False)
    status = Column(String, default="pending")
    options = Column(JSON, nullable=True) # Store ScanOptions
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Store summary stats directly on Scan for fast KPIs
    findings_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    
    target = relationship("Target", back_populates="scans")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    
    tool = Column(String) # "nuclei" or "zap"
    title = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String)
    location = Column(String) # URL or File
    
    false_positive = Column(Boolean, default=False)
    
    scan = relationship("Scan", back_populates="findings")
