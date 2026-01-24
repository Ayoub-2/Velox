from fastapi import APIRouter, HTTPException, BackgroundTasks
from models import ScanRequest, ScanResponse, ScanStatus, ScanType
from tasks import run_scan_task
from celery.result import AsyncResult
from typing import List, Dict
import uuid
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory store for demo purposes (Use DB in production)
# Structure: {scan_id: ScanResponse}
SCAN_DB: Dict[str, ScanResponse] = {}

@router.post("/scans", response_model=ScanResponse, status_code=201)
async def create_scan(request: ScanRequest):
    """
    Trigger a new security scan.
    """
    scan_id = str(uuid.uuid4())
    logger.info(f"Creating scan {scan_id} for {request.target_url}")
    
    # Create initial record
    scan_record = ScanResponse(
        id=scan_id,
        target_url=str(request.target_url),
        scan_type=request.scan_type,
        status=ScanStatus.PENDING,
        created_at=datetime.utcnow()
    )
    SCAN_DB[scan_id] = scan_record
    
    # Trigger Celery Task
    task = run_scan_task.delay(scan_id, str(request.target_url), request.scan_type)
    
    logger.info(f"Scan {scan_id} queued with Task ID {task.id}")
    return scan_record

@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan_status(scan_id: str):
    """
    Retrieve the status and results of a scan.
    """
    if scan_id not in SCAN_DB:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    scan_record = SCAN_DB[scan_id]
    
    # Check Celery status if still pending/running
    if scan_record.status in [ScanStatus.PENDING, ScanStatus.RUNNING]:
        # Note: In a real app, rely on DB updates from the worker.
        # Here we poll Celery for demo simplicity, but it's not ideal for scale.
        pass 
        
    return scan_record

@router.get("/scans", response_model=List[ScanResponse])
async def list_scans():
    """
    List all triggered scans.
    """
    return list(SCAN_DB.values())
