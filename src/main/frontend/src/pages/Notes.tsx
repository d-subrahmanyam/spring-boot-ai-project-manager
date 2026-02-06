import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { PlusIcon } from '@heroicons/react/24/outline';
import {
  fetchNotesRequest,
  createNoteRequest,
  updateNoteRequest,
  deleteNoteRequest,
  Note,
} from '../store/actions';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import MarkdownEditor from '../components/MarkdownEditor';

const Notes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notes, loading } = useAppSelector((state) => state.notes);
  const [showNewNote, setShowNewNote] = useState(false);

  useEffect(() => {
    dispatch(fetchNotesRequest());
  }, [dispatch]);

  const handleCreateNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch(createNoteRequest(note));
    setShowNewNote(false);
  };

  const handleUpdateNote = (note: Note) => {
    dispatch(updateNoteRequest(note));
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch(deleteNoteRequest(id));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
          onClick={() => setShowNewNote(!showNewNote)}
        >
          {showNewNote ? 'Cancel' : 'New Note'}
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {showNewNote && (
              <MarkdownEditor
                onSave={handleCreateNote}
                onCancel={() => setShowNewNote(false)}
              />
            )}
          </Grid>

          {notes.map((note) => (
            <Grid item xs={12} md={6} key={note.id}>
              <MarkdownEditor
                note={note}
                onSave={handleUpdateNote}
                onDelete={handleDeleteNote}
              />
            </Grid>
          ))}

          {notes.length === 0 && !showNewNote && (
            <Grid item xs={12}>
              <Typography color="textSecondary" align="center">
                No notes found. Create your first note with the markdown editor!
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Notes;
