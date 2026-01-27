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


class ScanOptions(BaseModel):
    # Performance
    rate_limit: int = 50
    concurrency: int = 25
    
    # Auth
    auth_headers: Optional[Dict[str, str]] = None
    
    # Scope
    use_ajax_spider: bool = False
    include_active_scan: bool = False
    nuclei_tags: Optional[str] = "cve,misconfig,exposures"

class ScanRequest(BaseModel):
    target_url: HttpUrl
    scan_type: ScanType = ScanType.NUCLEI
    options: ScanOptions = Field(default_factory=ScanOptions)
    
    class Config:
        json_schema_extra = {
            "example": {
                "target_url": "http://example.com",
                "scan_type": "nuclei",
                "options": {
                    "rate_limit": 50,
                    "use_ajax_spider": True
                }
            }
        }

class ScanResponse(BaseModel):
    id: str
    target_url: str
    scan_type: ScanType
    status: ScanStatus
    created_at: datetime
    options: ScanOptions
    result: Optional[List[Dict[str, Any]]] = None

