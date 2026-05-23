package com.velox.orchestrator.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id")
    private Target target;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "scan_type", nullable = false)
    private String scanType;

    @Column(nullable = false)
    @Builder.Default
    private String status = "pending";

    @Column(columnDefinition = "TEXT")
    private String options; // Serialized JSON string of ScanOptions

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "findings_count")
    @Builder.Default
    private Integer findingsCount = 0;

    @Column(name = "critical_count")
    @Builder.Default
    private Integer criticalCount = 0;

    @Column(name = "high_count")
    @Builder.Default
    private Integer highCount = 0;

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Finding> findings = new ArrayList<>();
}
