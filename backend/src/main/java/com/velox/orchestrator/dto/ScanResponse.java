package com.velox.orchestrator.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanResponse {
    private String id;
    private String target_url;
    private String scan_type;
    private String status;
    private LocalDateTime created_at;
    private ScanOptions options;
    private List<Map<String, Object>> result;
    private String sessionId;
}
