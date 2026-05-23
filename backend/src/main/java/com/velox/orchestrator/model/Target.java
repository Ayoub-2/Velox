package com.velox.orchestrator.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "targets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Target {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String url;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "target", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Scan> scans = new ArrayList<>();
}
