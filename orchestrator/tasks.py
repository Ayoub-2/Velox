from celery_app import celery_app
from tools.nuclei import NucleiWrapper
from tools.zap import ZAPWrapper
from models import ScanType, ScanOptions
import logging
from typing import Dict, Any

from config import settings

logger = logging.getLogger(__name__)

nuclei_runner = NucleiWrapper()
zap_runner = ZAPWrapper(base_url=settings.ZAP_URL)

@celery_app.task(bind=True, name="run_scan_task")
def run_scan_task(self, scan_id: str, target_url: str, scan_type: str, options: Dict[str, Any] = None):
    """
    Celery task to execute the requested scan type.
    """
    logger.info(f"Task {scan_id}: Starting {scan_type} scan for {target_url}")
    
    # Parse options dict back to Model
    scan_options = ScanOptions(**(options or {}))
    
    try:
        results = None
        
        if scan_type == ScanType.NUCLEI:
            results = nuclei_runner.run_scan(target_url, scan_options)
        elif scan_type == ScanType.BASELINE or scan_type == ScanType.FULL:
            # Baseline/Full mapping logic can be inside wrapper or here.
            # For ZAP, we trust options map more than "type" enum if fully flexible.
            # Or we force defaults based on type if options are empty.
            if scan_type == ScanType.FULL:
                scan_options.include_active_scan = True
                
            results = zap_runner.run_scan(target_url, scan_options)
        else:
            raise ValueError(f"Unknown scan type: {scan_type}")
            
        logger.info(f"Task {scan_id}: Scan completed successfully")
        return {
            "status": "completed",
            "findings": results,
            "scan_id": scan_id
        }
        
    except Exception as e:
        logger.error(f"Task {scan_id}: Failed - {str(e)}")
        # In a real app, we might update DB status to FAILED here
        raise e
