# Troubleshooting DAST Network Connectivity (Offline/No-Rebuild)

This guide provides solutions for common network issues where DAST containers cannot access internal resources or resolve DNS. 
**Constraint**: All fixes must rely on `docker-compose.yml` changes and restarts (`docker compose up -d`). **NO Dockerfile rebuilds allowed.**

## 1. Issue: Cannot Resolve Internal Hostnames
**Symptoms**: Script shows `❌ FAILED` for DNS Resolution.
**Cause**: Docker containers typically inherit Host DNS. If Host uses a local stub resolver (127.0.0.53), containers may fail to reach it or fall back to public DNS (8.8.8.8) which cannot resolve internal names.

### Fix A: Hardcode DNS Servers (Recommended)
Add your internal DNS server IPs strictly to the orchestration config.

**File**: `docker-compose.yml`
```yaml
services:
  api:
    dns:
      - 10.2.4.1  # Replace with your Internal DNS IP
      - 8.8.8.8   # Fallback
  zap:
    dns:
      - 10.2.4.1
```
**Apply**: `docker compose up -d`

### Fix B: Map Hostname Manually (If DNS is flaky)
If a specific internal domain is needed (e.g., `git.internal.corp`), map it directly to an IP.

**File**: `docker-compose.yml`
```yaml
services:
  api:
    extra_hosts:
      - "git.internal.corp:10.2.4.50"
      - "jira.internal.corp:10.2.4.51"
```
**Apply**: `docker compose up -d`

---

## 2. Issue: Cannot Ping/Reach Host IP (10.2.4.X)
**Symptoms**: Script shows `❌ FAILED` for IP Ping.
**Cause**:
1.  **Host Firewall**: The host (RHEL9) firewall might be blocking incoming connections from the Docker bridge interface (`docker0`).
2.  **Routing**: Docker subnet overlaps with physical network (Unlikely but possible).

### Fix: Allow Docker Zone in Firewall (Host-side)
Ensure the Docker interface is trusted.
```bash
# On Host Machine
firewall-cmd --permanent --zone=trusted --add-interface=docker0
firewall-cmd --reload
```

---

## 3. Issue: HTTP Proxy Interfering with Local Traffic
**Symptoms**: DNS works, Ping works, but application requests fail or return 403/502.
**Cause**: `HTTP_PROXY` env vars might be forcing local traffic through a proxy that denies it.

### Fix: Update NO_PROXY
Ensure your internal subnet and domains are in `NO_PROXY`.

**File**: `docker-compose.yml`
```yaml
services:
  api:
    environment:
      - NO_PROXY=localhost,127.0.0.1,10.2.4.0/24,.internal.corp,${NO_PROXY}
```
**Apply**: `docker compose up -d`
