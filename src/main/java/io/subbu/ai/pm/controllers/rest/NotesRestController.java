package io.subbu.ai.pm.controllers.rest;

import io.subbu.ai.pm.services.NoteService;
import io.subbu.ai.pm.vos.Note;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Notes API
 */
@RestController
@RequestMapping("/api/notes")
public class NotesRestController {

    private final NoteService noteService;

    public NotesRestController(NoteService noteService) {
        this.noteService = noteService;
    }

    /**
     * Get all notes
     *
     * @return List of all notes
     */
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        List<Note> notes = noteService.getAllNotes();
        return ResponseEntity.ok(notes);
    }

    /**
     * Get a note by ID
     *
     * @param id The note ID
     * @return The note
     */
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable String id) {
        Note note = noteService.getNoteById(id);
        return ResponseEntity.ok(note);
    }

    /**
     * Create a new note
     *
     * @param note The note to create
     * @return The created note
     */
    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        Note createdNote = noteService.createNote(note);
        return ResponseEntity.ok(createdNote);
    }

    /**
     * Update an existing note
     *
     * @param id The note ID
     * @param note The note data to update
     * @return The updated note
     */
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable String id, @RequestBody Note note) {
        Note updatedNote = noteService.updateNote(id, note);
        return ResponseEntity.ok(updatedNote);
    }

    /**
     * Delete a note
     *
     * @param id The note ID
     * @return Success response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable String id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
