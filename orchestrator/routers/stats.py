from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, text
from models_db import Scan, Finding
from database import get_db
from datetime import datetime, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/stats/summary")
async def get_summary_stats(db: AsyncSession = Depends(get_db)):
    """
    Get high-level dashboard stats.
    """
    # Total Scans
    scan_count_res = await db.execute(select(func.count(Scan.id)))
    total_scans = scan_count_res.scalar() or 0
    
    # Total Findings by Severity (Active/Latest)
    # Correct approach: Sum valid findings from completed scans or raw count?
    # Simple count from Finding table
    severity_counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0
    }
    
    res = await db.execute(
        select(Finding.severity, func.count(Finding.id))
        .group_by(Finding.severity)
    )
    for severity, count in res.all():
        if severity and severity.lower() in severity_counts:
            severity_counts[severity.lower()] = count
            
    return {
        "total_scans": total_scans,
        "findings": severity_counts
    }

@router.get("/stats/trend")
async def get_finding_trend(days: int = 7, db: AsyncSession = Depends(get_db)):
    """
    Get findings trend over the last N days.
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    # Group by Date (Postgres specific truncate)
    # Note: SQLite/others interpret 'day' differently, assuming PG here based on plan
    query = text("""
        SELECT date_trunc('day', created_at) as day, 
               SUM(critical_count) as critical,
               SUM(high_count) as high
        FROM scans
        WHERE created_at >= :since AND status = 'completed'
        GROUP BY day
        ORDER BY day ASC
    """)
    
    result = await db.execute(query, {"since": since})
    
    data = []
    for row in result:
        data.append({
            "date": row.day.strftime("%Y-%m-%d"),
            "critical": row.critical or 0,
            "high": row.high or 0
        })
        
    return data

@router.get("/stats/top-vulns")
async def get_top_vulnerabilities(limit: int = 5, db: AsyncSession = Depends(get_db)):
    """
    Get most frequent vulnerability titles.
    """
    res = await db.execute(
        select(Finding.title, func.count(Finding.id).label("count"))
        .group_by(Finding.title)
        .order_by(desc("count"))
        .limit(limit)
    )
    
    return [{"name": row.title, "count": row.count} for row in res.all()]
