package com.velox.orchestrator.controller;

import com.velox.orchestrator.dto.ScanRequest;
import com.velox.orchestrator.dto.ScanResponse;
import com.velox.orchestrator.service.ScanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/scans")
public class ScanController {
    private static final Logger logger = LoggerFactory.getLogger(ScanController.class);

    @Autowired
    private ScanService scanService;

    @PostMapping
    public ResponseEntity<ScanResponse> triggerScan(
            @RequestBody ScanRequest request,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId) {
        logger.info("Triggering scan: type={}, url={}", request.getScan_type(), request.getTarget_url());
        ScanResponse response = scanService.triggerScan(request, sessionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ScanResponse>> listScans(
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId) {
        logger.info("Listing scans for session ID: {}", sessionId);
        List<ScanResponse> scans = scanService.listScans(sessionId);
        return ResponseEntity.ok(scans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScanResponse> getScan(@PathVariable String id) {
        logger.info("Retrieving scan detail for ID: {}", id);
        return scanService.getScan(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportScanReport(@PathVariable String id) {
        logger.info("Exporting report for scan ID: {}", id);
        try {
            byte[] reportBytes = scanService.getExportReport(id);
            String filename = "velox_scan_" + id + ".xlsx";

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
