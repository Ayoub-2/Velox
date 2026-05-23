package com.velox.orchestrator.scanner;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.velox.orchestrator.dto.ScanOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Component
public class NucleiWrapper {
    private static final Logger logger = LoggerFactory.getLogger(NucleiWrapper.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nuclei.path:/usr/local/bin/nuclei}")
    private String nucleiPath;

    private final List<String> templatesCandidates = Arrays.asList(
            "/home/appuser/nuclei-templates",
            "/root/nuclei-templates",
            "/root/.nuclei-templates",
            "/root/.nuclei",
            "/root/.local/share/nuclei-templates"
    );

    public List<Map<String, Object>> runScan(String target, ScanOptions options) throws Exception {
        logger.info("Starting Nuclei scan for target: {} | Options: {}", target, options);

        File binaryFile = new File(nucleiPath);
        if (!binaryFile.exists() || !binaryFile.canExecute()) {
            logger.error("Nuclei binary not found or not executable at: {}", nucleiPath);
            throw new IllegalStateException("Nuclei binary is not executable at: " + nucleiPath);
        }

        List<String> command = new ArrayList<>();
        command.add(nucleiPath);
        command.add("-u");
        command.add(target);

        // Find templates directory
        String templatesPath = null;
        for (String candidate : templatesCandidates) {
            File dir = new File(candidate);
            if (dir.exists() && dir.isDirectory()) {
                templatesPath = candidate;
                break;
            }
        }

        if (templatesPath != null) {
            logger.info("Using nuclei templates path: {}", templatesPath);
            command.add("-t");
            command.add(templatesPath);
        } else {
            logger.warn("No nuclei templates path found in candidates; using binary default templates location");
        }

        // Add standard flags
        command.add("-j");      // JSON output
        command.add("-silent"); // Clean stdout
        command.add("-nm");      // No metadata
        command.add("-duc");     // Disable update check (critical for offline environments)

        // Concurrency / Rate Limiting
        command.add("-rl");
        command.add(String.valueOf(options.getRate_limit()));
        command.add("-c");
        command.add(String.valueOf(options.getConcurrency()));

        // Filtering tags
        if (options.getNuclei_tags() != null && !options.getNuclei_tags().trim().isEmpty()) {
            command.add("-tags");
            command.add(options.getNuclei_tags());
        }

        // Headers (Authorization / Cookie etc.)
        if (options.getAuth_headers() != null && !options.getAuth_headers().isEmpty()) {
            for (Map.Entry<String, String> entry : options.getAuth_headers().entrySet()) {
                command.add("-H");
                command.add(entry.getKey() + ": " + entry.getValue());
            }
        }

        // Log command (Redact secrets for logs)
        List<String> safeCommand = new ArrayList<>(command);
        for (int i = 0; i < safeCommand.size(); i++) {
            String arg = safeCommand.get(i);
            if (arg.contains("Cookie:") || arg.contains("Authorization:")) {
                safeCommand.set(i, "AUTH_REDACTED");
            }
        }
        logger.info("Executing Nuclei command: {}", String.join(" ", safeCommand));

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();

        List<Map<String, Object>> findings = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (!line.isEmpty()) {
                    try {
                        Map<String, Object> finding = objectMapper.readValue(line, new TypeReference<Map<String, Object>>() {});
                        findings.add(finding);
                    } catch (Exception ex) {
                        logger.warn("Could not parse nuclei output line: {} | Error: {}", line, ex.getMessage());
                    }
                }
            }
        }

        boolean finished = process.waitFor(1, TimeUnit.HOURS);
        if (!finished) {
            process.destroyForcibly();
            logger.error("Nuclei scan timed out");
            throw new RuntimeException("Nuclei scan timed out");
        }

        int exitCode = process.exitValue();
        logger.info("Nuclei scan completed with exit code: {}. Found {} findings.", exitCode, findings.size());
        if (exitCode != 0) {
            logger.warn("Nuclei binary exited with non-zero code: {}", exitCode);
        }

        return findings;
    }
}
