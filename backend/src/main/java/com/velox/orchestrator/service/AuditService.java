package com.velox.orchestrator.service;

import com.velox.orchestrator.model.AuditLog;
import com.velox.orchestrator.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String username, String action, String details) {
        AuditLog logEntry = AuditLog.builder()
                .username(username != null && !username.isBlank() ? username : "anonymous")
                .action(action)
                .details(details)
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(logEntry);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
