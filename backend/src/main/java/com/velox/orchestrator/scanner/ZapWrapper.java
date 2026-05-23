package com.velox.orchestrator.scanner;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.velox.orchestrator.dto.ScanOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Component
public class ZapWrapper {
    private static final Logger logger = LoggerFactory.getLogger(ZapWrapper.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    @Value("${zap.url:http://zap:8090}")
    private String zapUrl;

    public ZapWrapper() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    private Map<String, Object> sendRequest(String endpoint, Map<String, String> params) throws Exception {
        StringBuilder urlBuilder = new StringBuilder(zapUrl).append("/JSON/").append(endpoint);
        if (params != null && !params.isEmpty()) {
            urlBuilder.append("?");
            for (Map.Entry<String, String> entry : params.entrySet()) {
                urlBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                        .append("&");
            }
            urlBuilder.setLength(urlBuilder.length() - 1); // remove trailing &
        }

        String requestUrl = urlBuilder.toString();
        logger.debug("ZAP API Request: {}", requestUrl);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .timeout(Duration.ofMinutes(5))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("ZAP API error, status: " + response.statusCode() + " body: " + response.body());
        }

        return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
    }

    private void configureAuth(ScanOptions options) {
        if (options.getAuth_headers() == null || options.getAuth_headers().isEmpty()) {
            return;
        }

        logger.info("Configuring ZAP Auth Headers via Replacer");
        for (Map.Entry<String, String> entry : options.getAuth_headers().entrySet()) {
            try {
                Map<String, String> params = new HashMap<>();
                params.put("description", "Auth-" + entry.getKey());
                params.put("enabled", "true");
                params.put("matchType", "REQ_HEADER");
                params.put("matchRegex", "false");
                params.put("matchString", entry.getKey());
                params.put("replacement", entry.getValue());
                params.put("initiators", ""); // Apply to all (Spider, Scanner, etc.)

                sendRequest("replacer/action/addRule", params);
            } catch (Exception e) {
                logger.error("Failed to add ZAP Replacer Auth Rule: {}", e.getMessage());
            }
        }
    }

    public List<Map<String, Object>> runScan(String target, ScanOptions options) throws Exception {
        logger.info("Starting ZAP scan for target: {} | Options: {}", target, options);

        // 1. Configure authentication headers
        configureAuth(options);

        try {
            // 2. Traditional Spider
            logger.info("Starting ZAP Spider for: {}", target);
            Map<String, String> spiderParams = new HashMap<>();
            spiderParams.put("url", target);
            Map<String, Object> spiderResp = sendRequest("spider/action/scan", spiderParams);
            String spiderScanId = String.valueOf(spiderResp.get("scan"));
            waitForScan("spider", spiderScanId);

            // 3. Ajax Spider (optional)
            if (options.isUse_ajax_spider()) {
                logger.info("Starting ZAP Ajax Spider for: {}", target);
                Map<String, String> ajaxParams = new HashMap<>();
                ajaxParams.put("url", target);
                ajaxParams.put("inScope", "true");
                sendRequest("ajaxSpider/action/scan", ajaxParams);
                waitForAjaxSpider();
            }

            // 4. Active Scan (optional)
            if (options.isInclude_active_scan()) {
                logger.info("Starting ZAP Active Scan for: {}", target);
                Map<String, String> activeParams = new HashMap<>();
                activeParams.put("url", target);
                activeParams.put("recurse", "true");
                activeParams.put("inScopeOnly", "true");
                Map<String, Object> activeResp = sendRequest("ascan/action/scan", activeParams);
                String activeScanId = String.valueOf(activeResp.get("scan"));
                waitForScan("ascan", activeScanId);
            }

            // 5. Retrieve Alerts
            logger.info("Fetching alerts from ZAP for target: {}", target);
            Map<String, String> alertsParams = new HashMap<>();
            alertsParams.put("baseurl", target);
            Map<String, Object> alertsResp = sendRequest("core/view/alerts", alertsParams);

            List<Map<String, Object>> alerts = new ArrayList<>();
            if (alertsResp.containsKey("alerts")) {
                Object alertsObj = alertsResp.get("alerts");
                if (alertsObj instanceof List) {
                    alerts = (List<Map<String, Object>>) alertsObj;
                }
            }

            logger.info("ZAP Scan finished. Found {} issues.", alerts.size());
            return alerts;

        } finally {
            // Cleanup rules (simplistic rule reset: would require listing and deleting, ZAP typically keeps them.
            // In dev environments we can skip or run rule clear if required)
            clearReplacerRules();
        }
    }

    private void clearReplacerRules() {
        try {
            // Best effort clear: we fetch all rules and delete them to prevent token leakage pollution
            Map<String, Object> rulesResp = sendRequest("replacer/view/rules", null);
            if (rulesResp.containsKey("rules")) {
                List<Map<String, Object>> rules = (List<Map<String, Object>>) rulesResp.get("rules");
                for (Map<String, Object> rule : rules) {
                    String description = String.valueOf(rule.get("description"));
                    if (description.startsWith("Auth-")) {
                        Map<String, String> delParams = new HashMap<>();
                        delParams.put("description", description);
                        sendRequest("replacer/action/removeRule", delParams);
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Best effort ZAP rule cleanup failed: {}", e.getMessage());
        }
    }

    private void waitForScan(String component, String scanId) throws Exception {
        if (scanId == null || "null".equals(scanId) || scanId.isEmpty()) {
            throw new RuntimeException("ZAP scan ID was invalid for: " + component);
        }

        while (true) {
            Map<String, String> params = new HashMap<>();
            params.put("scanId", scanId);
            Map<String, Object> statusResp = sendRequest(component + "/view/status", params);
            int progress = Integer.parseInt(String.valueOf(statusResp.get("status")));
            logger.info("ZAP Component: {} | Scan ID: {} | Progress: {}%", component, scanId, progress);
            if (progress >= 100) {
                break;
            }
            Thread.sleep(2000);
        }
    }

    private void waitForAjaxSpider() throws Exception {
        while (true) {
            Map<String, Object> statusResp = sendRequest("ajaxSpider/view/status", null);
            String status = String.valueOf(statusResp.get("status"));
            logger.info("ZAP Ajax Spider status: {}", status);
            if ("stopped".equals(status)) {
                break;
            }
            Thread.sleep(2000);
        }
    }
}
