package io.subbu.ai.pm.services;

import io.subbu.ai.pm.mappers.NoteMapper;
import io.subbu.ai.pm.models.NoteEntity;
import io.subbu.ai.pm.repos.NoteRepository;
import io.subbu.ai.pm.vos.Note;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing notes
 */
@Service
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;

    public NoteService(NoteRepository noteRepository, NoteMapper noteMapper) {
        this.noteRepository = noteRepository;
        this.noteMapper = noteMapper;
    }

    /**
     * Get all notes
     *
     * @return List of all notes
     */
    public List<Note> getAllNotes() {
        List<NoteEntity> entities = noteRepository.findAllByOrderByCreatedAtDesc();
        return noteMapper.toVOList(entities);
    }

    /**
     * Get a note by ID
     *
     * @param id The note ID
     * @return The note
     */
    public Note getNoteById(String id) {
        NoteEntity entity = noteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Note not found: " + id));
        return noteMapper.toVO(entity);
    }

    /**
     * Get all notes for a project
     *
     * @param projectId The project ID
     * @return List of notes for the project
     */
    public List<Note> getNotesByProjectId(String projectId) {
        List<NoteEntity> entities = noteRepository.findByProjectId(projectId);
        return noteMapper.toVOList(entities);
    }

    /**
     * Create a new note
     *
     * @param note The note to create
     * @return The created note
     */
    public Note createNote(Note note) {
        NoteEntity entity = noteMapper.toEntity(note);
        NoteEntity savedEntity = noteRepository.save(entity);
        return noteMapper.toVO(savedEntity);
    }

    /**
     * Update an existing note
     *
     * @param id The note ID
     * @param note The note data to update
     * @return The updated note
     */
    public Note updateNote(String id, Note note) {
        NoteEntity entity = noteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Note not found: " + id));

        noteMapper.updateEntityFromVO(note, entity);
        NoteEntity savedEntity = noteRepository.save(entity);
        return noteMapper.toVO(savedEntity);
    }

    /**
     * Delete a note
     *
     * @param id The note ID
     */
    public void deleteNote(String id) {
        if (!noteRepository.existsById(id)) {
            throw new IllegalArgumentException("Note not found: " + id);
        }
        noteRepository.deleteById(id);
    }
}
