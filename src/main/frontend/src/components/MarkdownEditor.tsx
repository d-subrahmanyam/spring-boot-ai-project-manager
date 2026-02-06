import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import MDEditor from '@uiw/react-md-editor';
import { Note } from '../store/actions';

interface MarkdownEditorProps {
  note?: Note;
  onSave: (note: any) => void;
  onDelete?: (id: string) => void;
  onCancel?: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  note,
  onSave,
  onDelete,
  onCancel
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isEditing, setIsEditing] = useState(!note);

  const handleSave = () => {
    if (note) {
      onSave({ ...note, title, content });
    } else {
      onSave({ title, content });
    }
    setIsEditing(false);
    if (!note) {
      setTitle('');
      setContent('');
    }
  };

  const handleCancel = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsEditing(false);
    } else {
      setTitle('');
      setContent('');
    }
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {isEditing ? (
          <>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Content (Markdown)
              </Typography>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={400}
              />
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">{title}</Typography>
              <Box>
                <IconButton onClick={() => setIsEditing(true)} size="small">
                  <PencilIcon style={{ width: 20, height: 20 }} />
                </IconButton>
                {onDelete && note && (
                  <IconButton onClick={() => onDelete(note.id)} size="small" color="error">
                    <TrashIcon style={{ width: 20, height: 20 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
            <MDEditor.Markdown source={content} />
          </>
        )}
      </CardContent>
      {isEditing && (
        <CardActions>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!title || !content}
          >
            Save
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default MarkdownEditor;
