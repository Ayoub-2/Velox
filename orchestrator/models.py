from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class ScanType(str, Enum):
    BASELINE = "baseline"
    FULL = "full"
    NUCLEI = "nuclei"

class ScanStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class ScanRequest(BaseModel):
    target_url: HttpUrl
    scan_type: ScanType = ScanType.NUCLEI
    
    class Config:
        json_schema_extra = {
            "example": {
                "target_url": "http://example.com",
                "scan_type": "nuclei"
            }
        }

class ScanResponse(BaseModel):
    id: str
    target_url: str
    scan_type: ScanType
    status: ScanStatus
    created_at: datetime
    result: Optional[List[Dict[str, Any]]] = None
