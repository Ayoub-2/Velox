package com.velox.orchestrator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.velox.orchestrator.dto.ScanOptions;
import com.velox.orchestrator.dto.ScanRequest;
import com.velox.orchestrator.dto.ScanResponse;
import com.velox.orchestrator.model.Finding;
import com.velox.orchestrator.model.Scan;
import com.velox.orchestrator.model.Target;
import com.velox.orchestrator.repository.FindingRepository;
import com.velox.orchestrator.repository.ScanRepository;
import com.velox.orchestrator.repository.TargetRepository;
import com.velox.orchestrator.scanner.NucleiWrapper;
import com.velox.orchestrator.scanner.ZapWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ScanService {
    private static final Logger logger = LoggerFactory.getLogger(ScanService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private TargetRepository targetRepository;

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private FindingRepository findingRepository;

    @Autowired
    private NucleiWrapper nucleiWrapper;

    @Autowired
    private ZapWrapper zapWrapper;

    @Autowired
    private ReportService reportService;

    @Transactional
    public ScanResponse triggerScan(ScanRequest request, String sessionId) {
        String targetUrl = request.getTarget_url();
        
        // 1. Resolve Target (auto-create if new url)
        Target target = targetRepository.findFirstByUrl(targetUrl)
                .orElseGet(() -> {
                    Target newTarget = Target.builder()
                            .name(targetUrl)
                            .url(targetUrl)
                            .build();
                    return targetRepository.save(newTarget);
                });

        // 2. Prepare options (Redact auth_headers for DB saving)
        ScanOptions dbOptions = null;
        try {
            // Deep copy options
            String optionsJson = objectMapper.writeValueAsString(request.getOptions());
            dbOptions = objectMapper.readValue(optionsJson, ScanOptions.class);
            if (dbOptions.getAuth_headers() != null) {
                Map<String, String> redacted = new HashMap<>();
                redacted.put("REDACTED", "Sensitive credentials removed");
                dbOptions.setAuth_headers(redacted);
            }
        } catch (Exception e) {
            logger.error("Failed to process scan options: {}", e.getMessage());
        }

        String serializedDbOptions = "";
        try {
            serializedDbOptions = objectMapper.writeValueAsString(dbOptions);
        } catch (Exception ignored) {}

        // 3. Create Scan Record
        Scan scan = Scan.builder()
                .target(target)
                .sessionId(sessionId)
                .scanType(request.getScan_type())
                .status("pending")
                .options(serializedDbOptions)
                .build();
        scan = scanRepository.save(scan);

        // 4. Trigger Asynchronous Task
        // Pass original options with unredacted auth headers to the runner!
        runScanTaskAsync(scan.getId(), targetUrl, request.getScan_type(), request.getOptions());

        return convertToResponse(scan, targetUrl, request.getOptions(), null);
    }

    @Async
    public void runScanTaskAsync(String scanId, String targetUrl, String scanType, ScanOptions options) {
        logger.info("Executing Async Scan Task. ID: {} | Type: {} | Target: {}", scanId, scanType, targetUrl);
        
        // Update status to running
        updateScanStatus(scanId, "running", null);

        try {
            List<Map<String, Object>> rawFindings = new ArrayList<>();
            if ("nuclei".equalsIgnoreCase(scanType)) {
                rawFindings = nucleiWrapper.runScan(targetUrl, options);
            } else if ("baseline".equalsIgnoreCase(scanType) || "full".equalsIgnoreCase(scanType)) {
                if ("full".equalsIgnoreCase(scanType)) {
                    options.setInclude_active_scan(true);
                }
                rawFindings = zapWrapper.runScan(targetUrl, options);
            } else {
                throw new IllegalArgumentException("Unknown scan type: " + scanType);
            }

            saveFindings(scanId, scanType, rawFindings);
            updateScanStatus(scanId, "completed", rawFindings.size());

        } catch (Exception e) {
            logger.error("Scan ID: {} failed - Error: {}", scanId, e.getMessage(), e);
            updateScanStatus(scanId, "failed", null);
        }
    }

    @Transactional
    public void updateScanStatus(String scanId, String status, Integer findingsCount) {
        Scan scan = scanRepository.findById(scanId).orElse(null);
        if (scan != null) {
            scan.setStatus(status);
            if ("completed".equals(status)) {
                scan.setCompletedAt(LocalDateTime.now());
                if (findingsCount != null) {
                    scan.setFindingsCount(findingsCount);
                }
            } else if ("failed".equals(status)) {
                scan.setCompletedAt(LocalDateTime.now());
            }
            scanRepository.save(scan);
        }
    }

    @Transactional
    public void saveFindings(String scanId, String tool, List<Map<String, Object>> rawFindings) {
        Scan scan = scanRepository.findById(scanId).orElse(null);
        if (scan == null) return;

        int critical = 0;
        int high = 0;

        for (Map<String, Object> f : rawFindings) {
            Map<String, Object> info = (Map<String, Object>) f.getOrDefault("info", Collections.emptyMap());

            String name = String.valueOf(info.getOrDefault("name", 
                    f.getOrDefault("alert", 
                    f.getOrDefault("template", "Unknown"))));
            
            String severity = String.valueOf(info.getOrDefault("severity", 
                    f.getOrDefault("risk", "info"))).toLowerCase();

            String description = String.valueOf(info.getOrDefault("description", 
                    f.getOrDefault("description", "")));

            String location = String.valueOf(f.getOrDefault("matched-at", 
                    f.getOrDefault("url", "-")));

            if (location == null || "null".equals(location)) {
                location = "-";
            }

            if ("critical".equals(severity)) critical++;
            if ("high".equals(severity)) high++;

            Finding finding = Finding.builder()
                    .scan(scan)
                    .tool(tool)
                    .title(name)
                    .severity(severity)
                    .description(description)
                    .location(location)
                    .falsePositive(false)
                    .build();
            findingRepository.save(finding);
        }

        scan.setCriticalCount(critical);
        scan.setHighCount(high);
        scan.setFindingsCount(rawFindings.size());
        scanRepository.save(scan);
    }

    @Transactional(readOnly = true)
    public List<ScanResponse> listScans(String sessionId) {
        List<Scan> scans;
        if (sessionId != null && !sessionId.isEmpty()) {
            scans = scanRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
        } else {
            scans = scanRepository.findAllByOrderByCreatedAtDesc();
        }

        List<ScanResponse> responses = new ArrayList<>();
        for (Scan s : scans) {
            String targetUrl = s.getTarget() != null ? s.getTarget().getUrl() : "unknown";
            ScanOptions options = null;
            try {
                if (s.getOptions() != null && !s.getOptions().isEmpty()) {
                    options = objectMapper.readValue(s.getOptions(), ScanOptions.class);
                }
            } catch (Exception ignored) {}

            responses.add(convertToResponse(s, targetUrl, options, null));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public Optional<ScanResponse> getScan(String scanId) {
        return scanRepository.findById(scanId).map(s -> {
            String targetUrl = s.getTarget() != null ? s.getTarget().getUrl() : "unknown";
            ScanOptions options = null;
            try {
                if (s.getOptions() != null && !s.getOptions().isEmpty()) {
                    options = objectMapper.readValue(s.getOptions(), ScanOptions.class);
                }
            } catch (Exception ignored) {}

            List<Map<String, Object>> formattedFindings = new ArrayList<>();
            for (Finding f : s.getFindings()) {
                Map<String, Object> findingMap = new HashMap<>();
                Map<String, Object> info = new HashMap<>();
                info.put("name", f.getTitle());
                info.put("severity", f.getSeverity());
                info.put("description", f.getDescription());
                findingMap.put("info", info);
                findingMap.put("matched-at", f.getLocation());
                formattedFindings.add(findingMap);
            }

            return convertToResponse(s, targetUrl, options, formattedFindings);
        });
    }

    private ScanResponse convertToResponse(Scan s, String targetUrl, ScanOptions options, List<Map<String, Object>> results) {
        return ScanResponse.builder()
                .id(s.getId())
                .target_url(targetUrl)
                .scan_type(s.getScanType())
                .status(s.getStatus())
                .created_at(s.getCreatedAt())
                .options(options != null ? options : new ScanOptions())
                .result(results)
                .sessionId(s.getSessionId())
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] getExportReport(String scanId) throws IOException {
        Scan scan = scanRepository.findById(scanId)
                .orElseThrow(() -> new IllegalArgumentException("Scan not found: " + scanId));
        
        // Trigger lazy loading
        if (scan.getTarget() != null) {
            scan.getTarget().getUrl();
        }
        if (scan.getFindings() != null) {
            scan.getFindings().size();
        }
        
        return reportService.generateExcelReport(scan);
    }
}
