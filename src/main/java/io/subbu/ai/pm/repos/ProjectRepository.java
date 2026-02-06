package io.subbu.ai.pm.repos;

import io.subbu.ai.pm.models.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for Project entities
 */
@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, String> {

    /**
     * Find all projects ordered by creation date descending
     *
     * @return List of projects ordered by newest first
     */
    List<ProjectEntity> findAllByOrderByCreatedAtDesc();
}
