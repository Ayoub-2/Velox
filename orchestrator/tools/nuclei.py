import subprocess
import json
import logging
from typing import Dict, Any, List
from config import settings

logger = logging.getLogger(__name__)

class NucleiWrapper:
    """
    Wrapper for ProjectDiscovery Nuclei Scanner.
    Executes the binary and parses JSON output.
    """
    
    def __init__(self, binary_path: str = settings.NUCLEI_PATH):
        self.binary_path = binary_path

    def run_scan(self, target: str) -> List[Dict[str, Any]]:
        """
        Runs a basic Nuclei scan against the target.
        Returns a list of finding objects.
        """
        logger.info(f"Starting Nuclei scan for: {target}")
        
        command = [
            self.binary_path,
            "-target", target,
            "-json",  # Output as JSON
            "-silent", # Only show findings
            "-nm", # No meta details
        ]
        
        try:
            # Secure subprocess call - shell=False prevents injection
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=False, # We handle errors manually
                timeout=300 # 5 minute timeout
            )
            
            if result.returncode != 0:
                logger.error(f"Nuclei Execution Failed: {result.stderr}")
                raise Exception(f"Nuclei failed with code {result.returncode}")

            findings = []
            for line in result.stdout.splitlines():
                if line.strip():
                    try:
                        finding = json.loads(line)
                        findings.append(finding)
                    except json.JSONDecodeError:
                        logger.warning(f"Could not parse nuclei output line: {line}")
            
            logger.info(f"Scan completed. Found {len(findings)} issues.")
            return findings

        except subprocess.TimeoutExpired:
            logger.error("Nuclei scan timed out")
            raise Exception("Scan execution timed out")
        except Exception as e:
            logger.error(f"Unexpected error running Nuclei: {str(e)}")
            raise
