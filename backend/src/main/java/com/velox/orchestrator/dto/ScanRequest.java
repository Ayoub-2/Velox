package com.velox.orchestrator.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanRequest {
    private String target_url;
    
    @Builder.Default
    private String scan_type = "nuclei";

    @Builder.Default
    private ScanOptions options = new ScanOptions();
}
