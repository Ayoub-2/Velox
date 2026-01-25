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
    task = run_scan_task.apply_async(
        args=[scan_id, str(request.target_url), request.scan_type],
        task_id=scan_id
    )
    
    logger.info(f"Scan {scan_id} queued with Task ID {task.id}")
    return scan_record


def _update_scan_from_celery(scan_record: ScanResponse):
    """
    Helper to sync Celery task status with local DB record.
    """
    if scan_record.status in [ScanStatus.PENDING, ScanStatus.RUNNING]:
        task_result = AsyncResult(scan_record.id)
        if task_result.ready():
            try:
                result_data = task_result.get()
                # Update DB
                scan_record.status = ScanStatus.COMPLETED
                scan_record.result = result_data.get("findings")
            except Exception as e:
                scan_record.status = ScanStatus.FAILED
                logger.error(f"Scan {scan_record.id} failed: {e}")
        elif task_result.state == "STARTED":
             scan_record.status = ScanStatus.RUNNING

@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan_status(scan_id: str):
    """
    Retrieve the status and results of a scan.
    """
    if scan_id not in SCAN_DB:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    scan_record = SCAN_DB[scan_id]
    _update_scan_from_celery(scan_record)
             
    return scan_record

@router.get("/scans", response_model=List[ScanResponse])
async def list_scans():
    """
    List all triggered scans.
    """
    # Sync status for all active scans
    for scan in SCAN_DB.values():
        _update_scan_from_celery(scan)
        
    return list(SCAN_DB.values())

@router.get("/scans/{scan_id}/export")
async def export_scan_report(scan_id: str):
    """
    Export scan results as an Excel file.
    """
    from fastapi.responses import StreamingResponse
    import pandas as pd
    import io

    if scan_id not in SCAN_DB:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    scan = SCAN_DB[scan_id]
    _update_scan_from_celery(scan)
    
    if not scan.result:
        raise HTTPException(status_code=400, detail="No results to export")
        
    # Flatten findings for Excel
    rows = []
    for finding in scan.result:
        # Normalize fields between ZAP and Nuclei
        name = finding.get('info', {}).get('name') or finding.get('alert') or finding.get('template') or 'Unknown'
        severity = finding.get('info', {}).get('severity') or finding.get('risk') or 'info'
        url = finding.get('matched-at') or finding.get('url') or '-'
        description = finding.get('info', {}).get('description') or finding.get('description') or ''
        solution = finding.get('info', {}).get('remediation') or finding.get('solution') or ''
        extracted = str(finding.get('extracted-results', ''))
        
        rows.append({
            "Severity": severity.upper(),
            "Issue": name,
            "Location": url,
            "Description": description,
            "Solution/Remediation": solution,
            "Extracted Data": extracted
        })
        
    df = pd.DataFrame(rows)
    
    # Create Excel buffer
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Findings')
        
    output.seek(0)
    
    filename = f"velox_scan_{scan_id}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
