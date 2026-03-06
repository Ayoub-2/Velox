# Technical Design: Red Hat Docker DNS Integration

## 1. Feature Overview
Velox is fully dockerized. In standard Linux environments, Docker handles DNS resolution seamlessly. However, Red Hat Enterprise Linux (RHEL) heavily utilizes `systemd-resolved` or `NetworkManager` bound to a local loopback address (e.g., `127.0.0.53`). Docker explicitly ignores local loopback addresses in `/etc/resolv.conf` and defaults to Google Public DNS (`8.8.8.8` and `8.8.4.4`). 

This behavior breaks internal DNS resolution for Velox containers and scanning tools like Nuclei, which subsequently fail to resolve internal corporate services or Identity Management (IdM) endpoints. This feature bridges the gap by dynamically mapping the host's true upstream DNS into the Docker environment.

## 2. Technical Design
The strategy is to make Velox containers access DNS resolution exactly like the host itself, without inventing custom Python-based DNS clients. 

Before `docker-compose up` is executed, a lightweight shell pre-flight script (`scripts/setup_rh_dns.sh`) will run to detect the true upstream DNS servers from the Red Hat host (bypassing the stub resolver). It will validate the IP addresses and securely inject them into Velox's global `.env` configuration file as `VELOX_INTERNAL_DNS`.

The `docker-compose.yml` file will be updated so that every container explicitly uses this environment variable for its `dns:` property. 

## 3. DNS Resolution Implementation
- **Service Discovery Mechanism**: Containers will natively use the internal DNS servers configured on the host network interface. Tools like Nuclei will seamlessly resolve internal SRV and A records via standard OS socket calls inside the container.
- **Failover Behavior**: If the host NetworkManager returns multiple DNS servers, they are all passed to Docker. If the script fails to detect a valid DNS, it is configured to fail-closed and halt deployment explicitly (User Global Rule 39), printing a clear error rather than allowing a silent fallback to `8.8.8.8`.

## 4. Scope of Changes
Modifications require minimal codebase changes, focusing entirely on orchestration and deployment:
- **`scripts/setup_rh_dns.sh`** [NEW]: Extracts active DNS IPs via `nmcli dev show | grep IP4.DNS` or parsing `/run/systemd/resolve/resolv.conf`.
- **`docker-compose.yml`** [MODIFY]: Add the `dns:` array to the `orchestrator`, `frontend`, and any other applicable services.
- **`.env.example`** [MODIFY]: Add `VELOX_INTERNAL_DNS` placeholder.

## 5. Configuration Examples
Sample configuration of the deployment injection:

**`.env` file (Auto-populated by script):**
```env
VELOX_INTERNAL_DNS="10.0.5.53"
VELOX_INTERNAL_DNS_SECONDARY="10.0.5.54"
```

**`docker-compose.yml` mapping:**
```yaml
services:
  orchestrator:
    build: 
      context: ./orchestrator
    dns:
      - ${VELOX_INTERNAL_DNS:-8.8.8.8}
      - ${VELOX_INTERNAL_DNS_SECONDARY:-8.8.4.4}
```

## 6. Security Considerations
- **Hostile Input Treatment (Rule 15 & 16)**: The output of `nmcli` or system files is treated as potentially hostile. The `setup_rh_dns.sh` script will enforce strict structural validation (regex matching for valid IPv4/IPv6 addresses) before writing anything into the `.env` file to prevent environment variable injection.
- **Safe Failure Modes (Rule 19)**: The setup script will run with `set -euo pipefail`. By failing loudly upon DNS detection errors, we prevent containers from spinning up in a degraded, public-DNS-only state, which could lead to false-negative security scans by Nuclei against internal targets.
- **Cache Security**: DNS caching and security (DNSSEC) responsibility is deferred to the internal DNS server or the host's `systemd-resolved` stub, simplifying the Velox attack surface.

## 7. Testing Strategy
A QA report will be generated and stored under `project-docs/qa/`. Testing will prioritize:
- **Failure Modes explicitly (Rule 12)**: 
  - Run the setup script on a host with no active network interface to verify it fails loudly.
  - Mock `nmcli` to return malformed IP addresses and verify the bash regex validation successfully blocks the injection.
- **Security Regression (Rule 11)**: Ensure that injecting the `dns:` property does not inadvertently expose container networks or bridge interfaces to unwanted zones.
- **Reproducibility (Rule 26)**: A Red Hat UBI-based test container or Vagrant VM will be used to simulate the environment and prove the extraction logic.

## 8. Backwards Compatibility
Highly compatible. If the `setup_rh_dns.sh` script is not run (e.g., standard Ubuntu/Debian deployments where Docker works fine out of the box), the `docker-compose.yml` variable interpolation gracefully falls back to default Docker behavior unless strictly overridden.
