from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from models import ScanRequest, ScanResponse as ScanResponsePydantic, ScanStatus, ScanOptions
from models_db import Scan, Finding, Target # DB Models
from database import get_db
from tasks import run_scan_task
from celery.result import AsyncResult
from typing import List
import uuid
from datetime import datetime
import logging
import pandas as pd
import io
from fastapi.responses import StreamingResponse

router = APIRouter()
logger = logging.getLogger(__name__)

async def _get_scan_or_404(scan_id: str, db: AsyncSession) -> Scan:
    result = await db.execute(select(Scan).options(selectinload(Scan.findings)).where(Scan.id == scan_id))
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

async def _sync_scan_with_celery(scan: Scan, db: AsyncSession):
    """
    Checks Celery task status and updates DB if changed.
    """
    if scan.status in [ScanStatus.PENDING, ScanStatus.RUNNING]:
        task_result = AsyncResult(scan.id)
        
        if task_result.ready():
            try:
                # Task finished
                result_data = task_result.get()
                
                # Update Scan status
                scan.status = ScanStatus.COMPLETED
                scan.completed_at = datetime.utcnow()
                scan.findings_count = len(result_data.get("findings", []))
                
                # Process Findings (Flatten JSON to DB Rows)
                findings_data = result_data.get("findings", [])
                critical = 0
                high = 0
                
                for f in findings_data:
                    # Normalize fields
                    name = f.get('info', {}).get('name') or f.get('alert') or f.get('template') or 'Unknown'
                    severity = str(f.get('info', {}).get('severity') or f.get('risk') or 'info').lower()
                    desc = f.get('info', {}).get('description') or f.get('description') or ''
                    loc = f.get('matched-at') or f.get('url') or '-'
                    
                    if severity == 'critical': critical += 1
                    if severity == 'high': high += 1
                    
                    db_finding = Finding(
                        scan_id=scan.id,
                        tool=scan.scan_type,
                        title=name,
                        severity=severity,
                        description=desc,
                        location=loc
                    )
                    db.add(db_finding)
                
                scan.critical_count = critical
                scan.high_count = high
                
                await db.commit()
                await db.refresh(scan)
                
            except Exception as e:
                logger.error(f"Scan {scan.id} failed during sync: {e}")
                scan.status = ScanStatus.FAILED
                await db.commit()
                
        elif task_result.state == "STARTED":
             if scan.status != ScanStatus.RUNNING:
                 scan.status = ScanStatus.RUNNING
                 await db.commit()

@router.post("/scans", response_model=ScanResponsePydantic, status_code=201)
async def create_scan(request: ScanRequest, db: AsyncSession = Depends(get_db)):
    """
    Trigger a new security scan.
    """
    scan_id = str(uuid.uuid4())
    logger.info(f"Creating scan {scan_id} for {request.target_url}")
    
    # 1. Resolve Target (Auto-create if new URL)
    target_url_str = str(request.target_url)
    result = await db.execute(select(Target).where(Target.url == target_url_str))
    target = result.scalars().first()
    
    if not target:
        target = Target(name=target_url_str, url=target_url_str)
        db.add(target)
        await db.commit()
        await db.refresh(target)
    
    # 2. Create Scan Record
    # SECURITY: Redact auth_headers before saving to DB
    scan_options_dump = request.options.model_dump()
    db_options = scan_options_dump.copy()
    if db_options.get("auth_headers"):
        db_options["auth_headers"] = {"REDACTED": "Sensitive credentials removed"}

    new_scan = Scan(
        id=scan_id,
        target_id=target.id,
        scan_type=request.scan_type,
        status=ScanStatus.PENDING,
        options=db_options, # Store REDACTED options
    )
    db.add(new_scan)
    await db.commit()
    
    # 3. Trigger Celery Task
    run_scan_task.apply_async(
        args=[scan_id, target_url_str, request.scan_type, request.options.model_dump()],
        task_id=scan_id
    )
    
    # 4. Return Pydantic Response
    return ScanResponsePydantic(
        id=new_scan.id,
        target_url=target_url_str,
        scan_type=new_scan.scan_type,
        status=ScanStatus.PENDING,
        created_at=new_scan.created_at,
        options=request.options
    )

@router.get("/scans/{scan_id}", response_model=ScanResponsePydantic)
async def get_scan_status(scan_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve the status and results of a scan.
    """
    scan = await _get_scan_or_404(scan_id, db)
    
    # Sync status
    await _sync_scan_with_celery(scan, db)
    
    # Load relationships (target for url)
    # simple query again to ensuring target is loaded or use lazy loading if config allowed
    # Explicit join is better for async
    result = await db.execute(select(Target).where(Target.id == scan.target_id))
    target = result.scalars().first()
    target_url = target.url if target else "unknown"
    
    # Format Findings for Response
    formatted_findings = []
    if scan.findings:
        for f in scan.findings:
            formatted_findings.append({
                "info": {
                    "name": f.title,
                    "severity": f.severity,
                    "description": f.description
                },
                "matched-at": f.location
            })
            
    return ScanResponsePydantic(
        id=scan.id,
        target_url=target_url,
        scan_type=scan.scan_type,
        status=scan.status,
        created_at=scan.created_at,
        options=ScanOptions(**(scan.options or {})),
        result=formatted_findings
    )

@router.get("/scans", response_model=List[ScanResponsePydantic])
async def list_scans(db: AsyncSession = Depends(get_db)):
    """
    List all triggered scans.
    """
    # Fetch top 50 recent scans
    result = await db.execute(select(Scan).order_by(desc(Scan.created_at)).limit(50))
    scans = result.scalars().all()
    
    response = []
    for scan in scans:
        await _sync_scan_with_celery(scan, db)
        
        # Optimize: Batch load targets in real app
        t_result = await db.execute(select(Target).where(Target.id == scan.target_id))
        target = t_result.scalars().first()
        target_url = target.url if target else "unknown"
        
        response.append(ScanResponsePydantic(
            id=scan.id,
            target_url=target_url,
            scan_type=scan.scan_type,
            status=scan.status,
            created_at=scan.created_at,
            options=ScanOptions(**(scan.options or {}))
        ))
        
    return response

@router.get("/scans/{scan_id}/export")
async def export_scan_report(scan_id: str, format: str = "xlsx", db: AsyncSession = Depends(get_db)):
    """
    Export scan results as Excel or PDF.
    """
    scan = await _get_scan_or_404(scan_id, db)
    await _sync_scan_with_celery(scan, db)
    
    # Load findings explicitly if not loaded
    if not scan.findings:
        # In a real app we might reload or check if lazy loaded attached
        pass
        
    if format == "pdf":
         from utils.report_gen import generate_pdf_report
         pdf_bytes = generate_pdf_report(scan, scan.findings)
         
         filename = f"velox_scan_{scan_id}.pdf"
         return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    # Default to XLSX
    if not scan.findings:
        raise HTTPException(status_code=400, detail="No results to export")
        
    # Flatten findings for Excel
    rows = []
    for finding in scan.findings:
        rows.append({
            "Severity": finding.severity.upper(),
            "Issue": finding.title,
            "Location": finding.location,
            "Description": finding.description,
            "False Positive": finding.false_positive
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
