package com.velox.orchestrator.controller;

import com.velox.orchestrator.dto.ScanRequest;
import com.velox.orchestrator.dto.ScanResponse;
import com.velox.orchestrator.service.ScanService;
import com.velox.orchestrator.service.AuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/scans")
public class ScanController {
    private static final Logger logger = LoggerFactory.getLogger(ScanController.class);

    @Autowired
    private ScanService scanService;

    @Autowired
    private AuditService auditService;

    private String getUsername(Jwt jwt) {
        if (jwt == null) return "anonymous";
        String username = jwt.getClaimAsString("preferred_username");
        return (username != null && !username.isBlank()) ? username : jwt.getSubject();
    }

    private boolean checkIsAdmin(Jwt jwt) {
        if (jwt == null) return false;
        String username = getUsername(jwt);
        if ("admin".equalsIgnoreCase(username)) return true;
        
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            return roles.contains("admin");
        }
        return false;
    }

    @PostMapping
    public ResponseEntity<ScanResponse> triggerScan(
            @RequestBody ScanRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(jwt);
        logger.info("Triggering scan: type={}, url={} for user={}", request.getScan_type(), request.getTarget_url(), username);
        ScanResponse response = scanService.triggerScan(request, username);
        auditService.log(username, "TRIGGER_SCAN", "Target: " + request.getTarget_url() + ", Type: " + request.getScan_type() + ", Scan ID: " + response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ScanResponse>> listScans(
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(jwt);
        boolean isAdmin = checkIsAdmin(jwt);
        logger.info("Listing scans for user={}, isAdmin={}", username, isAdmin);
        
        List<ScanResponse> scans;
        if (isAdmin) {
            scans = scanService.listScans(null);
        } else {
            scans = scanService.listScans(username);
        }
        
        auditService.log(username, "LIST_SCANS", "Count: " + scans.size() + ", Admin: " + isAdmin);
        return ResponseEntity.ok(scans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScanResponse> getScan(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(jwt);
        boolean isAdmin = checkIsAdmin(jwt);
        logger.info("Retrieving scan detail for ID: {} (user={})", id, username);
        
        Optional<ScanResponse> scanOpt = scanService.getScan(id);
        if (scanOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ScanResponse scan = scanOpt.get();
        if (!isAdmin && !username.equals(scan.getSessionId())) {
            logger.warn("Unauthorized access attempt to scan ID: {} by user: {}", id, username);
            auditService.log(username, "UNAUTHORIZED_SCAN_ACCESS", "Scan ID: " + id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        auditService.log(username, "GET_SCAN", "Scan ID: " + id);
        return ResponseEntity.ok(scan);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportScanReport(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(jwt);
        boolean isAdmin = checkIsAdmin(jwt);
        logger.info("Exporting report for scan ID: {} (user={})", id, username);
        
        Optional<ScanResponse> scanOpt = scanService.getScan(id);
        if (scanOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ScanResponse scan = scanOpt.get();
        if (!isAdmin && !username.equals(scan.getSessionId())) {
            logger.warn("Unauthorized report export attempt to scan ID: {} by user: {}", id, username);
            auditService.log(username, "UNAUTHORIZED_REPORT_EXPORT", "Scan ID: " + id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        try {
            byte[] reportBytes = scanService.getExportReport(id);
            String filename = "velox_scan_" + id + ".xlsx";
            auditService.log(username, "EXPORT_REPORT", "Scan ID: " + id);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(reportBytes);
        } catch (IllegalArgumentException e) {
            logger.warn("Scan not found for export: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            logger.error("Failed to generate Excel report for scan ID: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Export failed");
        }
    }
}

