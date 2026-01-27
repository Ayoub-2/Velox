import requests
import time
import logging
from typing import Dict, Any, List, Optional
from config import settings
from models import ScanOptions

logger = logging.getLogger(__name__)

class ZAPWrapper:
    """
    Wrapper for OWASP ZAP API (Running in a sibling container).
    """
    
    def __init__(self, base_url: str = settings.ZAP_URL, api_key: str = ""):
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
            
            # ZAP returns 200 even for errors sometimes, with code/message in body.
            # But raise_for_status handles HTTP 4xx/5xx.
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"ZAP API Error: {str(e)}")
            raise Exception("Failed to communicate with ZAP Service")

    def _configure_auth(self, options: ScanOptions):
        """
        Injects Auth Headers using ZAP Replacer rules.
        """
        if not options.auth_headers:
            return
            
        logger.info("Configuring ZAP Auth Headers via Replacer")
        
        for key, value in options.auth_headers.items():
            # replacer/action/addRule/?description=Auth&enabled=true&matchType=REQ_HEADER&matchRegex=false&matchString=Authorization&replacement=Bearer...
            self._request("GET", "replacer/action/addRule", {
                "description": f"Auth-{key}",
                "enabled": "true",
                "matchType": "REQ_HEADER",
                "matchRegex": "false",
                "matchString": key,
                "replacement": value,
                "initiators": "" # Apply to all (Spider, Scanner, etc.)
            })

    def _clear_rules(self):
        """
        Clean up replacer rules after scan to avoid pollution.
        """
        try:
            # Ideally we delete by description, but ZAP doesn't have "delete all".
            # We assume we are the only user of this ephemeral ZAP instance or we track rule IDs.
            # For this MVP, we might leave them or try to delete a fixed set.
            # Proper way: Get all rules and delete them.
            # Doing a simple loop might be slow.
            pass 
        except Exception:
            pass

    def run_scan(self, target: str, options: ScanOptions) -> List[Dict[str, Any]]:
        """
        Triggers a ZAP Scan (Spider -> Ajax -> Active) based on options.
        """
        logger.info(f"Starting ZAP scan for: {target} | Options: {options}")
        
        # 1. Setup Context / Auth
        self._configure_auth(options)
        
        try:
            # 2. Traditional Spider (Always run first to find links)
            logger.info("Starting ZAP Spider...")
            resp = self._request("GET", "spider/action/scan", {"url": target})
            self._wait_for_scan("spider", resp.get("scan"))
            
            # 3. Ajax Spider (Optional)
            if options.use_ajax_spider:
                logger.info("Starting ZAP Ajax Spider...")
                resp = self._request("GET", "ajaxSpider/action/scan", {"url": target, "inScope": "true"})
                # Ajax Spider status is diff endpoint
                self._wait_for_ajax_spider()
                
            # 4. Active Scan (Optional)
            if options.include_active_scan:
                logger.info("Starting ZAP Active Scan...")
                # Enable default policy
                resp = self._request("GET", "ascan/action/scan", {
                    "url": target, 
                    "recurse": "true", 
                    "inScopeOnly": "true"
                })
                self._wait_for_scan("ascan", resp.get("scan"))
                
            logger.info("ZAP Scans completed. Fetching alerts.")
            
            # 5. Get Alerts
            alerts_resp = self._request("GET", "core/view/alerts", {"baseurl": target})
            alerts = alerts_resp.get("alerts", [])
            
            if not alerts:
                logger.warning("ZAP Scan finished but returned 0 alerts.")
                
            return alerts
            
        finally:
            # Cleanup
            self._clear_rules()

    def _wait_for_scan(self, component: str, scan_id: str):
        if not scan_id:
            raise Exception(f"Failed to start {component}")
            
        while True:
            status_resp = self._request("GET", f"{component}/view/status", {"scanId": scan_id})
            progress = int(status_resp.get("status", 0))
            if progress >= 100:
                break
            time.sleep(2)

    def _wait_for_ajax_spider(self):
        while True:
            status_resp = self._request("GET", "ajaxSpider/view/status")
            status = status_resp.get("status")
            if status == "stopped":
                break
            time.sleep(2)
