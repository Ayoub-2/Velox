# Velox Installation Guide (RHEL 9)

This guide details the procedure for deploying Velox on Red Hat Enterprise Linux 9, specifically for air-gapped or proxy-restricted environments.

## 1. Prerequisites (Offline/Proxy)

> **Quick Start**: You can use the helper script to auto-configure Firewall and SELinux:
> ```bash
> sudo chmod +x scripts/quick_config_rhel9.sh
> sudo ./scripts/quick_config_rhel9.sh
> ```

### System Requirements
- **OS**: RHEL 9.x
- **Docker**: Version 24+ (Rootless supported but requires extra config)
- **SELinux**: Enforcing (Default)

### Proxy Configuration
If your server is behind a proxy, you must configure Docker to pass traffic through it.

1. Create the systemd drop-in directory:
   ```bash
   mkdir -p /etc/systemd/system/docker.service.d
   ```

2. Create `/etc/systemd/system/docker.service.d/http-proxy.conf`:
   ```ini
   [Service]
   Environment="HTTP_PROXY=http://proxy.example.com:8080"
   Environment="HTTPS_PROXY=http://proxy.example.com:8080"
   Environment="NO_PROXY=localhost,127.0.0.1,docker-registry.somecorporation.com"
   ```

3. Reload and restart Docker:
   ```bash
   systemctl daemon-reload
   systemctl restart docker
   ```

## 2. Firewall Configuration (`firewalld`)

Open the necessary ports for the application.

```bash
# Frontend
firewall-cmd --permanent --add-port=8080/tcp

# Apply changes
firewall-cmd --reload
```

## 3. SELinux & Volume Mounts

RHEL 9 enforces strict SELinux policies. When mounting host directories (like `./knowledge-base`) into containers, you **must** ensure they have the correct security context.

### Option A: Let Docker Handle Context (Recommended)
Docker handles this automatically if you append `:z` (shared) or `:Z` (private) to the volume mount in `docker-compose.yml`.
*Velox ships with read-only mounts configured, but if you change them, be aware of this.*

### Option B: Manual Context Setting
If you see "Permission denied" errors on mounted volumes:

```bash
# Set context for Knowledge Base
chcon -Rt svirt_sandbox_file_t ./knowledge-base

# Set context for Reports
chcon -Rt svirt_sandbox_file_t ./reports

# Set context for backups
chcon -Rt svirt_sandbox_file_t ./backups
```

## 4. Production Deployment

### Step 1: Prepare Environment
Create a `.env` file with your production secrets:

```bash
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
NO_PROXY=localhost,127.0.0.1
POSTGRES_USER=velox_prod
POSTGRES_PASSWORD=strong_password
POSTGRES_DB=velox_production
```

### Step 2: Build & Run
Run the application in detached mode. This command uses the production `docker-compose.yml` configuration.

```bash
docker compose up --build -d
```

### Step 3: Verify Health
Check the status of services:

```bash
docker compose ps
# Ensure all services show "healthy"
```

Check the logs for the backup service:
```bash
docker compose logs db-backup
```

## 5. Offline Maintenance (Air-Gapped)

Velox is designed to run without internet access at runtime.
- **Nuclei Templates**: Baked into the `velox-api` image during build.
- **Updates**: To update templates, you must pull a new image or rebuild with internet access.
- **Debugging**: The backend container includes `curl`, `ping`, and `psql` for troubleshooting.

To access the database console:
```bash
docker compose exec db psql -U velox_prod -d velox_production
```
