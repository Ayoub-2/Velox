package com.velox.orchestrator.repository;

import com.velox.orchestrator.model.Target;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TargetRepository extends JpaRepository<Target, String> {
    Optional<Target> findFirstByUrl(String url);
}
