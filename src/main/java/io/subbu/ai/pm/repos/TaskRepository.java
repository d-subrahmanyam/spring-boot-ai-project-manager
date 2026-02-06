package io.subbu.ai.pm.repos;

import io.subbu.ai.pm.models.ProjectEntity;
import io.subbu.ai.pm.models.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for Task entities
 */
@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, String> {

    /**
     * Find all tasks for a specific project
     *
     * @param project The project entity
     * @return List of tasks belonging to the project
     */
    List<TaskEntity> findByProject(ProjectEntity project);

    /**
     * Find all tasks for a specific project by project ID
     *
     * @param projectId The ID of the project
     * @return List of tasks belonging to the project
     */
    @Query("SELECT t FROM TaskEntity t WHERE t.project.id = :projectId")
    List<TaskEntity> findByProjectId(String projectId);

    /**
     * Find all tasks by status
     *
     * @param status The status to filter by
     * @return List of tasks with the specified status
     */
    List<TaskEntity> findByStatus(String status);

    /**
     * Find all tasks assigned to a specific agent
     *
     * @param assignedAgent The agent name
     * @return List of tasks assigned to the agent
     */
    List<TaskEntity> findByAssignedAgent(String assignedAgent);

    /**
     * Find tasks by project ID and status
     *
     * @param projectId The ID of the project
     * @param status The status to filter by
     * @return List of tasks matching the criteria
     */
    @Query("SELECT t FROM TaskEntity t WHERE t.project.id = :projectId AND t.status = :status")
    List<TaskEntity> findByProjectIdAndStatus(String projectId, String status);

    /**
     * Count tasks by project ID
     *
     * @param projectId The ID of the project
     * @return Count of tasks for the project
     */
    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.project.id = :projectId")
    long countByProjectId(String projectId);

    /**
     * Get all distinct project IDs
     *
     * @return List of distinct project IDs
     */
    @Query("SELECT DISTINCT t.project.id FROM TaskEntity t")
    List<String> findDistinctProjectIds();
}
