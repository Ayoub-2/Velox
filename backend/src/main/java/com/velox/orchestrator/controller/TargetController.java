package com.velox.orchestrator.controller;

import com.velox.orchestrator.dto.TargetResponse;
import com.velox.orchestrator.model.Scan;
import com.velox.orchestrator.model.Target;
import com.velox.orchestrator.repository.ScanRepository;
import com.velox.orchestrator.repository.TargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/targets")
public class TargetController {

    @Autowired
    private TargetRepository targetRepository;

    @Autowired
    private ScanRepository scanRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<TargetResponse>> listTargets() {
        List<Target> targets = targetRepository.findAll();
        List<TargetResponse> responses = new ArrayList<>();
        
        for (Target t : targets) {
            long count = scanRepository.countByTargetId(t.getId());
            Optional<Scan> lastScan = scanRepository.findFirstByTargetIdOrderByCreatedAtDesc(t.getId());
            LocalDateTime lastScanDate = lastScan.map(Scan::getCreatedAt).orElse(null);
            
            responses.add(TargetResponse.builder()
                    .id(t.getId())
                    .name(t.getName())
                    .url(t.getUrl())
                    .created_at(t.getCreatedAt())
                    .scan_count((int) count)
                    .last_scan_date(lastScanDate)
                    .build());
        }
        
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<TargetResponse> getTarget(@PathVariable String id) {
        return targetRepository.findById(id)
                .map(t -> {
                    long count = scanRepository.countByTargetId(t.getId());
                    Optional<Scan> lastScan = scanRepository.findFirstByTargetIdOrderByCreatedAtDesc(t.getId());
                    LocalDateTime lastScanDate = lastScan.map(Scan::getCreatedAt).orElse(null);
                    
                    return ResponseEntity.ok(TargetResponse.builder()
                            .id(t.getId())
                            .name(t.getName())
                            .url(t.getUrl())
                            .created_at(t.getCreatedAt())
                            .scan_count((int) count)
                            .last_scan_date(lastScanDate)
                            .build());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
