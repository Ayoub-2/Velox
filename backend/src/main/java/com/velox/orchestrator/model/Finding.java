package com.velox.orchestrator.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "findings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Finding {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    private Scan scan;

    private String tool; // "nuclei" or "zap"

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String severity; // "critical", "high", "medium", "low", "info"

    private String location; // Matched URL or file context

    @Column(name = "false_positive")
    @Builder.Default
    private Boolean falsePositive = false;
}
