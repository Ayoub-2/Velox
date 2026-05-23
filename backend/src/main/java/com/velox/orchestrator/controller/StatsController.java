package com.velox.orchestrator.controller;

import com.velox.orchestrator.repository.FindingRepository;
import com.velox.orchestrator.repository.ScanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private FindingRepository findingRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummaryStats() {
        long totalScans = scanRepository.count();

        Map<String, Long> severityCounts = new HashMap<>();
        severityCounts.put("critical", 0L);
        severityCounts.put("high", 0L);
        severityCounts.put("medium", 0L);
        severityCounts.put("low", 0L);
        severityCounts.put("info", 0L);

        List<Object[]> counts = findingRepository.countFindingsBySeverity();
        for (Object[] row : counts) {
            if (row[0] != null) {
                String sev = row[0].toString().toLowerCase();
                if (severityCounts.containsKey(sev)) {
                    severityCounts.put(sev, ((Number) row[1]).longValue());
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("total_scans", totalScans);
        response.put("findings", severityCounts);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/trend")
    public ResponseEntity<List<Map<String, Object>>> getFindingTrend(@RequestParam(defaultValue = "7") int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> trendRows = scanRepository.findFindingTrend(since);

        List<Map<String, Object>> trendData = new ArrayList<>();
        for (Object[] row : trendRows) {
            Map<String, Object> item = new HashMap<>();
            // Formatted date
            item.put("date", row[0].toString());
            item.put("critical", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            item.put("high", row[2] != null ? ((Number) row[2]).longValue() : 0L);
            trendData.add(item);
        }

        return ResponseEntity.ok(trendData);
    }

    @GetMapping("/top-vulns")
    public ResponseEntity<List<Map<String, Object>>> getTopVulnerabilities(@RequestParam(defaultValue = "5") int limit) {
        List<Object[]> topRows = findingRepository.findTopVulnerabilities(PageRequest.of(0, limit));

        List<Map<String, Object>> topVulns = new ArrayList<>();
        for (Object[] row : topRows) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", row[0] != null ? row[0].toString() : "Unknown");
            item.put("count", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            topVulns.add(item);
        }

        return ResponseEntity.ok(topVulns);
    }
}
