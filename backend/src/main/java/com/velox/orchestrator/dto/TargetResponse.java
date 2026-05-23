package com.velox.orchestrator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TargetResponse {
    private String id;
    private String name;
    private String url;
    private LocalDateTime created_at;
    private Integer scan_count;
    private LocalDateTime last_scan_date;
}
