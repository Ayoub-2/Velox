# Threat Model: Red Hat Docker DNS Integration

## 1. Description and Scope
This document outlines the threat model for the revised Red Hat DNS integration feature in Velox. The scope covers the `scripts/setup_rh_dns.sh` pre-flight script, the extraction of DNS configuration from the host OS (RHEL/CentOS), the injection of this data into the `.env` file, and its consumption by Docker Compose.

## 2. Architecture Changes and Trust Boundaries
The architectural change shifts DNS resolution from implicit Docker defaults (`8.8.8.8`) to explicit mapping of the host's actual network interfaces.
- **Trust Boundary 1 (Host OS to Script)**: The extraction of data from `/run/systemd/resolve/resolv.conf` or `nmcli`.
- **Trust Boundary 2 (Script to Environment)**: The writing of extracted IP addresses into the `.env` file.
- **Trust Boundary 3 (Environment to Container)**: Docker daemon configuring the internal container's `/etc/resolv.conf` based on the `.env` values.

## 3. STRIDE Threat Analysis

### 3.1 Spoofing
- **Threat**: An attacker on the local network spoofs the internal Red Hat Identity Management DNS server, returning malicious A/AAAA or SRV records pointing Velox traffic toward an attacker-controlled host.
- **Mitigation**: Implicit Trust. The Velox containers simply inherit the DNS security posture of the host OS. If the Red Hat host requires DNSSEC or DoT via `systemd-resolved`, the host handles the validation before caching. Velox relies on the infrastructure's network security boundaries (Rule 42 - Verify Assumptions).

### 3.2 Tampering
- **Threat**: Local modification of the `setup_rh_dns.sh` script, or malicious manipulation of `nmcli` outputs to inject invalid commands or arbitrary text into the `.env` file, corrupting the Docker Compose environment.
- **Mitigation (Rule 15 & 16 - Hostile Input)**: The setup script treats the host's DNS output as untrusted. An explicit, strict regular expression (`^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$`) must validate the extracted string before it is exported. If the validation fails, execution halts entirely.

### 3.3 Repudiation
- **Threat**: The script modifies the `.env` file with new DNS servers without leaving an audit trail, making it difficult to debug Nuclei scanning failures.
- **Mitigation**: The execution of `setup_rh_dns.sh` will echo securely obfuscated confirmation logs to STDOUT (e.g., `Configured VELOX_INTERNAL_DNS=10.0.5.***`) and fail explicitly on errors, leaving CI/CD traces.

### 3.4 Information Disclosure
- **Threat**: The `VELOX_INTERNAL_DNS` values in the `.env` file expose the internal network topology (e.g., sensitive IdM/FreeIPA IPs) to unauthorized users on the file system.
- **Mitigation**: The deployment script explicitly enforces POSIX permissions `chmod 600 .env` ensuring only the owner (and root/Docker context) can read the configuration file (Rule 21).

### 3.5 Denial of Service (DoS)
- **Threat**: NetworkManager on the host returns a captive portal IP or an unreachable DNS server, stalling all scanning tools (e.g., Nuclei) inside the container indefinitely.
- **Mitigation (Rule 10 & 18)**: Nuclei templates and Python network calls strictly enforce execution timeouts. Additionally, the `setup_rh_dns.sh` script does not execute silently; if `nmcli` or the config files are missing, it fails fast (Fail-Closed) preventing a degraded start (Rule 39 - Automated tasks fail loudly).

### 3.6 Elevation of Privilege
- **Threat**: Shell expansion or OS-command injection occurs when reading the `.env` file inside `docker-compose.yml` if the DNS variable contained unescaped quotes or subshells (e.g., `$(rm -rf /)`).
- **Mitigation (Rule 15 & 16)**: The strict IPv4/IPv6 regex validation guarantees that only syntactically valid IP addresses are written. No string interpolation or `eval` functions are used to parse the DNS results in the shell script.

## 4. Assessment & Residual Risks
This architecture leans heavily on the security of the underlying Red Hat host. The primary residual risk is Host DNS Hijacking or DHCP spoofing at the enterprise network layer prior to the script's execution. By strictly validating the extracted IP formats and enforcing fail-closed mechanisms, Velox safely bounds the risk within standard Docker operational paradigms.
