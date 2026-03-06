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

        # Candidate templates paths (build time may place templates under root)
        self.templates_candidates = [
            "/home/appuser/nuclei-templates",
            "/root/nuclei-templates",
            "/root/.nuclei-templates",
            "/root/.nuclei",
            "/root/.local/share/nuclei-templates",
        ]
        self.templates_path = None

    def run_scan(self, target: str, options: ScanOptions) -> List[Dict[str, Any]]:
        """
        Runs a specific Nuclei scan against the target with provided options.
        Returns a list of finding objects.
        """
        logger.info(f"Starting Nuclei scan for: {target} | Options: {options}")
        
        # Validate binary exists and is executable
        if not os.path.isfile(self.binary_path) or not os.access(self.binary_path, os.X_OK):
            logger.error(f"Nuclei binary not found or not executable at: {self.binary_path}")
            raise Exception(f"Nuclei binary not found or not executable at: {self.binary_path}")

        # Base Command
        command = [
            self.binary_path,
            "-u",
            target,
        ]

        # Pick the first existing templates dir from candidates
        for p in self.templates_candidates:
            if os.path.isdir(p):
                self.templates_path = p
                break

        if self.templates_path:
            logger.info(f"Using nuclei templates path: {self.templates_path}")
            command.extend(["-t", self.templates_path])
        else:
            logger.warning("No nuclei templates path found in candidates; using binary default templates location")

        # Common flags
        command.extend([
            "-j",            # JSON output
            "-silent",       # Only output results
            "-nm",           # No metadata in output (cleaner parsing)
            "-duc",          # Disable update check (Crucial for offline/air-gapped)
        ])
        
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
            
            # Detailed diagnostics for troubleshooting
            logger.debug(f"Nuclei exit code: {result.returncode}")
            logger.debug(f"Nuclei stdout: {result.stdout}")
            logger.debug(f"Nuclei stderr: {result.stderr}")

            if result.returncode != 0:
                logger.error(
                    f"Nuclei Execution Failed (code {result.returncode}). Stderr: {result.stderr}. Stdout: {result.stdout}"
                )
                raise Exception(
                    f"Nuclei failed with code {result.returncode}. Stderr: {result.stderr}. Stdout: {result.stdout}"
                )

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
