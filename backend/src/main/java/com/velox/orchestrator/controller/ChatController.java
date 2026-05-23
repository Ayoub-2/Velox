package com.velox.orchestrator.controller;

import com.velox.orchestrator.dto.ChatMessage;
import com.velox.orchestrator.dto.ChatRequest;
import com.velox.orchestrator.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private static final Set<String> VALID_PERSONAS = Set.of("GRC", "Pentest", "Dev");

    @Autowired
    private ChatService chatService;

    // Custom Exceptions for exception handlers to resolve return-type serialization issues
    public static class ChatValidationException extends RuntimeException {
        public ChatValidationException(String message) {
            super(message);
        }
    }

    public static class ChatConfigurationException extends RuntimeException {
        public ChatConfigurationException(String message) {
            super(message);
        }
    }

    public static class DlpBlockedException extends RuntimeException {
        public DlpBlockedException() {
            super("DLP Blocked");
        }
    }

    @ExceptionHandler(ChatValidationException.class)
    public ResponseEntity<Map<String, String>> handleChatValidation(ChatValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ChatConfigurationException.class)
    public ResponseEntity<Map<String, String>> handleChatConfiguration(ChatConfigurationException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(DlpBlockedException.class)
    public ResponseEntity<Map<String, Object>> handleDlpBlocked(DlpBlockedException ex) {
        Map<String, Object> assistantMessage = new HashMap<>();
        assistantMessage.put("role", "assistant");
        assistantMessage.put("content", "🛡️ **DLP Alert**: Message securely blocked before transmission. Please remove any sensitive PII, credit cards, or internal secret keys before sending.");
        return ResponseEntity.ok(Map.of("message", assistantMessage));
    }

    @PostMapping
    public ResponseEntity<StreamingResponseBody> chat(@RequestBody ChatRequest request) {
        if (request.getMessages() == null || request.getMessages().isEmpty()) {
            throw new ChatValidationException("Messages array is required");
        }

        String persona = request.getPersona();
        if (persona == null || !VALID_PERSONAS.contains(persona)) {
            throw new ChatValidationException("Valid persona is required (GRC, Pentest, Dev)");
        }

        // Pre-flight DLP check on the user's latest incoming message
        ChatMessage latestMessage = request.getMessages().get(request.getMessages().size() - 1);
        if ("user".equalsIgnoreCase(latestMessage.getRole()) && chatService.containsSensitiveData(latestMessage.getContent())) {
            logger.warn("DLP Triggered! Message contains sensitive data. Blocking message.");
            chatService.logAudit("DLP_BLOCKED", persona, latestMessage.getContent());
            throw new DlpBlockedException();
        }

        if (!chatService.isConfigured()) {
            logger.error("OpenRouter API key is not configured.");
            throw new ChatConfigurationException("AI capabilities are not configured correctly");
        }

        if ("user".equalsIgnoreCase(latestMessage.getRole())) {
            chatService.logAudit("PROCESSED", persona, latestMessage.getContent());
        }

        // Return SSE Stream
        StreamingResponseBody responseBody = outputStream -> {
            try (InputStream is = chatService.streamChat(request)) {
                is.transferTo(outputStream);
            } catch (Exception e) {
                logger.error("Error during streaming: {}", e.getMessage());
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_EVENT_STREAM_VALUE)
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .header(HttpHeaders.CONNECTION, "keep-alive")
                .body(responseBody);
    }
}
