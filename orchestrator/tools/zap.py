import requests
import time
import logging
from typing import Dict, Any, List
from config import settings

logger = logging.getLogger(__name__)

class ZAPWrapper:
    """
    Wrapper for OWASP ZAP API (Running in a sibling container).
    """
    
    def __init__(self, base_url: str = "http://zap:8080", api_key: str = ""):
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {"X-ZAP-API-Key": api_key}

    def _request(self, method: str, endpoint: str, params: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/JSON/{endpoint}"
            params = params or {}
            params['apikey'] = self.api_key
            
            # User requested to "wait forever" (deep scan). 
            # We set a very high timeout (1 hour) to allow ZAP to process large result sets.
            response = requests.request(method, url, params=params, headers=self.headers, timeout=3600)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"ZAP API Error: {str(e)}")
            raise Exception("Failed to communicate with ZAP Service")

    def run_baseline_scan(self, target: str) -> Dict[str, Any]:
        """
        Triggers a ZAP Spider scan + Passive Scan.
        """
        logger.info(f"Starting ZAP Spider for: {target}")
        
        # 1. Start Spider
        resp = self._request("GET", "spider/action/scan", {"url": target})
        scan_id = resp.get("scan")
        
        if not scan_id:
            raise Exception("Failed to start ZAP spider")
            
        # 2. Poll Status (Wait until finished)
        while True:
            status_resp = self._request("GET", "spider/view/status", {"scanId": scan_id})
            progress = int(status_resp.get("status", 0))
            if progress >= 100:
                break
            time.sleep(2)
            
        logger.info("ZAP Spider completed. Fetching alerts.")
        
        # 3. Get Alerts
        alerts_resp = self._request("GET", "core/view/alerts", {"baseurl": target})
        alerts = alerts_resp.get("alerts", [])
        
        if not alerts:
            logger.warning("ZAP Scan finished but returned 0 alerts.")
            # We return empty list (success) but log it. 
            # If user wants strict "failure" on empty data, we could raise Exception here.
            # But 0 findings is a valid security result.
            
        return alerts
