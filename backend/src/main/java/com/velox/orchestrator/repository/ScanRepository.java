package com.velox.orchestrator.repository;

import com.velox.orchestrator.model.Scan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScanRepository extends JpaRepository<Scan, String> {
    List<Scan> findBySessionIdOrderByCreatedAtDesc(String sessionId);
    List<Scan> findAllByOrderByCreatedAtDesc();

    @Query("SELECT CAST(s.createdAt AS date) as day, SUM(s.criticalCount) as critical, SUM(s.highCount) as high " +
           "FROM Scan s " +
           "WHERE s.createdAt >= ?1 AND s.status = 'completed' " +
           "GROUP BY CAST(s.createdAt AS date) " +
           "ORDER BY day ASC")
    List<Object[]> findFindingTrend(LocalDateTime since);

    long countByTargetId(String targetId);
    java.util.Optional<Scan> findFirstByTargetIdOrderByCreatedAtDesc(String targetId);
}
