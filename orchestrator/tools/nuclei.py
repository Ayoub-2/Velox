import subprocess
import json
import logging
import os
from typing import Dict, Any, List, Optional
from config import settings
from models import ScanOptions

logger = logging.getLogger(__name__)

class NucleiWrapper:
    """
    Wrapper for ProjectDiscovery Nuclei Scanner.
    Executes the binary and parses JSON output.
    """
    
    def __init__(self, binary_path: str = settings.NUCLEI_PATH):
        self.binary_path = binary_path

    def run_scan(self, target: str, options: ScanOptions) -> List[Dict[str, Any]]:
        """
        Runs a specific Nuclei scan against the target with provided options.
        Returns a list of finding objects.
        """
        logger.info(f"Starting Nuclei scan for: {target} | Options: {options}")
        
        # Base Command
        command = [
            self.binary_path,
            "-u", target,
            "-t", "/home/appuser/nuclei-templates", # Ensure this path is correct in Docker
            "-j",            # JSON output
            "-silent",       # Only output results
            "-nm",           # No metadata in output (cleaner parsing)
            "-disable-update", # Disable automatic template updates
        ]
        
        # 1. Performance Tuning
        command.extend(["-rl", str(options.rate_limit)])
        command.extend(["-c", str(options.concurrency)])
        
        # 2. Filtering / Workflow
        if options.nuclei_tags:
            command.extend(["-tags", options.nuclei_tags])
            
        # 3. Authentication (Header Injection)
        # We need to be careful with sensitive data in logs.
        if options.auth_headers:
            for key, value in options.auth_headers.items():
                # Nuclei accepts headers via -H "Key: Value"
                command.extend(["-H", f"{key}: {value}"])
        
        # Debug: Log the command (Redact auth if needed)
        # Using a safe string for logging
        safe_command = list(command)
        if options.auth_headers:
             # Simple redaction for log safety
             safe_command = [c if "Cookie" not in c and "Authorization" not in c else "AUTH_REDACTED" for c in command]
             
        logger.info(f"Executing: {' '.join(safe_command)}")

        try:
            # Secure subprocess call - shell=False prevents injection
            # Environment variables can be passed if needed for advanced auth, but CLI flags are standard for simple cases.
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=False, # We handle errors manually
                timeout=3600 # 1 hour timeout for authenticated/slower scans
            )
            
            if result.returncode != 0:
                logger.error(f"Nuclei Execution Failed: {result.stderr}")
                raise Exception(f"Nuclei failed with code {result.returncode}. Stderr: {result.stderr}")

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
