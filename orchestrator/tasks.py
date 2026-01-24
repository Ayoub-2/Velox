from celery_app import celery_app
from tools.nuclei import NucleiWrapper
from tools.zap import ZAPWrapper
from models import ScanType, ScanResult
import logging

logger = logging.getLogger(__name__)

nuclei_runner = NucleiWrapper()
zap_runner = ZAPWrapper() # Expects ZAP container at http://zap:8080

@celery_app.task(bind=True, name="run_scan_task")
def run_scan_task(self, scan_id: str, target_url: str, scan_type: str):
    """
    Celery task to execute the requested scan type.
    """
    logger.info(f"Task {scan_id}: Starting {scan_type} scan for {target_url}")
    
    try:
        results = None
        
        if scan_type == ScanType.NUCLEI:
            results = nuclei_runner.run_scan(target_url)
        elif scan_type == ScanType.BASELINE: # ZAP
            results = zap_runner.run_baseline_scan(target_url)
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
