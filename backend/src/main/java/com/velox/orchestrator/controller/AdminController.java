package com.velox.orchestrator.controller;

import com.velox.orchestrator.model.AuditLog;
import com.velox.orchestrator.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/audit")
    public ResponseEntity<?> getAuditLogs(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String username = jwt.getClaimAsString("preferred_username");
        boolean isAdmin = "admin".equalsIgnoreCase(username);

        // Check realm_access.roles
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles.contains("admin")) {
                isAdmin = true;
            }
        }

        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access Denied: Admin role required"));
        }

        List<AuditLog> logs = auditService.getLogs();
        return ResponseEntity.ok(logs);
    }
}
