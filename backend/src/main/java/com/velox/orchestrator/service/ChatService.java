package com.velox.orchestrator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.velox.orchestrator.dto.ChatMessage;
import com.velox.orchestrator.dto.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ChatService {
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String openRouterUrl;

    @Value("${audit.log.path:../project-docs/security/ai_audit.jsonl}")
    private String auditLogPath;

    private static final Map<String, String> PERSONA_PROMPTS = Map.of(
        "GRC", "You are an expert Governance, Risk, and Compliance (GRC) professional in multinational bank. Your goal is to guide the user on regulatory frameworks (e.g., ISO 27001, SOC 2, NIST), risk assessment strategies, and corporate compliance programs. Always provide structured, official, and policy-oriented advice. FORMAT Rule : Always respond in simple text response, no markdown formatting. EFFICIENCY Rule: always keep response short and concise. CRITICAL DLP RULE: If the user provides any raw sensitive data, passwords, or PII, refuse to process it and remind them of data security policies.",
        "Pentest", "You are an elite Penetration Tester and Offensive Security Expert in multinational bank. Your goal is to help the user understand attack vectors, vulnerability exploitation, and remediation. Focus on technical details, proof-of-concept explanations, and security posture improvement. Never provide malicious payloads intended for illegal use. FORMAT Rule : Always respond in simple text response, no markdown formatting. EFFICIENCY Rule: always keep response short and concise. CRITICAL DLP RULE: Do not solicit or process real internal corporate credentials, sensitive source code, or PII.",
        "Dev", "You are a Senior DevSecOps Software Engineer in multinational bank. Your goal is to help the user implement secure coding practices, architect resilient systems, and debug code from a security-first perspective. Write clean, readable code snippets and explain technical decisions clearly. FORMAT Rule : Always respond in simple text response, no markdown formatting. EFFICIENCY Rule: always keep response short and concise. CRITICAL DLP RULE: If the user provides proprietary source code containing hardcoded secrets or PII, immediately warn them to redact the information before continuing."
    );

    private static final Pattern[] DLP_PATTERNS = new Pattern[] {
        Pattern.compile("([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", Pattern.CASE_INSENSITIVE), // Email Addresses
        Pattern.compile("(?:\\d[ -]*?){13,16}"), // Credit Card Numbers (Basic)
        Pattern.compile("(?:api_key|access_token|secret(?:_key)?|password)[\\s]*[:=][\\s]*[\"']?[a-zA-Z0-9\\-_]{16,}[\"']?", Pattern.CASE_INSENSITIVE) // Secrets
    };

    public boolean containsSensitiveData(String text) {
        if (text == null) return false;
        for (Pattern pattern : DLP_PATTERNS) {
            if (pattern.matcher(text).find()) {
                return true;
            }
        }
        return false;
    }

    public void logAudit(String status, String persona, String content) {
        try {
            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("timestamp", Instant.now().toString());
            logEntry.put("persona", persona);
            logEntry.put("status", status);
            logEntry.put("prompt", content);

            String line = objectMapper.writeValueAsString(logEntry) + "\n";
            File logFile = new File(auditLogPath);
            File parentDir = logFile.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            Files.writeString(
                logFile.toPath(),
                line,
                StandardOpenOption.CREATE,
                StandardOpenOption.APPEND
            );
        } catch (Exception e) {
            logger.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    public boolean isConfigured() {
        return openRouterApiKey != null && !openRouterApiKey.isBlank();
    }

    public InputStream streamChat(ChatRequest request) throws IOException, InterruptedException {
        if (!isConfigured()) {
            throw new IllegalStateException("OpenRouter API key is not configured");
        }

        String persona = request.getPersona();
        String systemPrompt = PERSONA_PROMPTS.getOrDefault(persona, PERSONA_PROMPTS.get("Pentest"));

        // Format payloads
        List<Map<String, String>> messagesPayload = new ArrayList<>();
        
        // Add System prompt message
        messagesPayload.add(Map.of("role", "system", "content", systemPrompt));

        // Get last 30 messages
        List<ChatMessage> history = request.getMessages();
        int startIndex = Math.max(0, history.size() - 30);
        for (int i = startIndex; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            messagesPayload.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("model", "openrouter/auto");
        requestPayload.put("messages", messagesPayload);
        requestPayload.put("stream", true);

        String payloadJson = objectMapper.writeValueAsString(requestPayload);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(openRouterUrl))
                .header("Authorization", "Bearer " + openRouterApiKey)
                .header("Content-Type", "application/json")
                .header("HTTP-Referer", "http://localhost:8080")
                .header("X-Title", "Velox Chat")
                .POST(HttpRequest.BodyPublishers.ofString(payloadJson))
                .build();

        logger.info("Forwarding request to OpenRouter: model=openrouter/auto, context_size={}", messagesPayload.size());

        HttpResponse<InputStream> resp = client.send(req, HttpResponse.BodyHandlers.ofInputStream());

        if (resp.statusCode() != 200) {
            try (InputStream is = resp.body()) {
                String errorText = new String(is.readAllBytes());
                logger.error("OpenRouter API returned error HTTP {}: {}", resp.statusCode(), errorText);
            }
            throw new IOException("Failed to communicate with OpenRouter. Status: " + resp.statusCode());
        }

        return resp.body();
    }
}
