package com.velox.orchestrator.controller;

import com.velox.orchestrator.service.KbService;
import com.velox.orchestrator.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kb")
public class KbController {

    @Autowired
    private KbService kbService;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public ResponseEntity<List<KbService.DocMetadata>> listDocs() {
        return ResponseEntity.ok(kbService.getSortedDocsData());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KbService.DocData> getDoc(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        String username = "anonymous";
        if (jwt != null) {
            String claimUser = jwt.getClaimAsString("preferred_username");
            username = (claimUser != null && !claimUser.isBlank()) ? claimUser : jwt.getSubject();
        }
        auditService.log(username, "VIEW_KB", "Article ID: " + id);
        return kbService.getDocData(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/match")
    public ResponseEntity<Map<String, Object>> matchDoc(@RequestParam(required = false) String q) {
        Map<String, Object> response = new HashMap<>();
        if (q == null || q.isBlank()) {
            response.put("match", null);
            return ResponseEntity.ok(response);
        }

        return kbService.matchDoc(q)
                .map(match -> {
                    response.put("match", match);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("match", null);
                    return ResponseEntity.ok(response);
                });
    }
}
