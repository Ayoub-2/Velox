package com.velox.orchestrator.repository;

import com.velox.orchestrator.model.Finding;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FindingRepository extends JpaRepository<Finding, String> {
    
    @Query("SELECT f.severity, COUNT(f.id) FROM Finding f GROUP BY f.severity")
    List<Object[]> countFindingsBySeverity();

    @Query("SELECT f.title as title, COUNT(f.id) as count FROM Finding f GROUP BY f.title ORDER BY count DESC")
    List<Object[]> findTopVulnerabilities(Pageable pageable);
}
