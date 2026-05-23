package com.velox.orchestrator.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanOptions {
    @Builder.Default
    private int rate_limit = 50;

    @Builder.Default
    private int concurrency = 25;

    private Map<String, String> auth_headers;

    @Builder.Default
    private boolean use_ajax_spider = false;

    @Builder.Default
    private boolean include_active_scan = false;

    @Builder.Default
    private String nuclei_tags = "cve,misconfig,exposures";
}
