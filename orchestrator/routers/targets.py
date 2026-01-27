from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from models_db import Target, Scan # DB Models
from database import get_db

router = APIRouter()

class TargetResponse(BaseModel):
    id: str
    name: str
    url: str
    created_at: datetime
    scan_count: int = 0
    last_scan_date: Optional[datetime] = None

@router.get("/targets", response_model=List[TargetResponse])
async def list_targets(db: AsyncSession = Depends(get_db)):
    """
    List all Targets (Projects) with summary stats.
    """
    # Optimized query
    # We could do a join/group by, but for simplicity/async:
    result = await db.execute(select(Target))
    targets = result.scalars().all()
    
    response = []
    for t in targets:
        # Count scans
        # In a real app, optimize this with SQL count()
        scan_result = await db.execute(select(func.count(Scan.id)).where(Scan.target_id == t.id))
        count = scan_result.scalar() or 0
        
        # Last scan
        last_scan_result = await db.execute(
            select(Scan.created_at).where(Scan.target_id == t.id).order_by(Scan.created_at.desc()).limit(1)
        )
        last_scan = last_scan_result.scalar()
        
        response.append(TargetResponse(
            id=t.id,
            name=t.name,
            url=t.url,
            created_at=t.created_at,
            scan_count=count,
            last_scan_date=last_scan
        ))
        
    return response

@router.get("/targets/{target_id}", response_model=TargetResponse)
async def get_target(target_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Target).where(Target.id == target_id))
    target = result.scalars().first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
        
    # Stats
    scan_result = await db.execute(select(func.count(Scan.id)).where(Scan.target_id == target.id))
    count = scan_result.scalar() or 0
    
    last_scan_result = await db.execute(
        select(Scan.created_at).where(Scan.target_id == target.id).order_by(Scan.created_at.desc()).limit(1)
    )
    last_scan = last_scan_result.scalar()
        
    return TargetResponse(
        id=target.id,
        name=target.name,
        url=target.url,
        created_at=target.created_at,
        scan_count=count,
        last_scan_date=last_scan
    )
