package io.subbu.ai.pm.repos;

import io.subbu.ai.pm.models.NoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for Note entities
 */
@Repository
public interface NoteRepository extends JpaRepository<NoteEntity, String> {

    /**
     * Find all notes for a specific project
     *
     * @param projectId The ID of the project
     * @return List of notes belonging to the project
     */
    List<NoteEntity> findByProjectId(String projectId);

    /**
     * Find all notes ordered by creation date descending
     *
     * @return List of notes ordered by newest first
     */
    List<NoteEntity> findAllByOrderByCreatedAtDesc();
}
