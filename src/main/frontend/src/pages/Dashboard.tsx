import { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  DocumentTextIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { fetchNotesRequest } from '../store/actions';
import { fetchAgentProjectsRequest } from '../store/actions/agentActions';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector((state) => state.agent);
  const { notes } = useAppSelector((state) => state.notes);

  useEffect(() => {
    dispatch(fetchAgentProjectsRequest());
    dispatch(fetchNotesRequest());
  }, [dispatch]);

  const statsCards = [
    {
      title: 'AI Agent Projects',
      value: projects.length,
      icon: <SparklesIcon style={{ width: 48, height: 48 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Notes',
      value: notes.length,
      icon: <DocumentTextIcon style={{ width: 48, height: 48 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Recent Activity',
      value: 'Today',
      icon: <ClockIcon style={{ width: 48, height: 48 }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent AI Projects
            </Typography>
            {projects.slice(0, 5).map((projectId) => (
              <Box key={projectId} sx={{ mb: 2, p: 1, borderLeft: 3, borderColor: 'primary.main' }}>
                <Typography variant="subtitle1">{projectId}</Typography>
                <Typography variant="body2" color="textSecondary">
                  AI-powered project
                </Typography>
              </Box>
            ))}
            {projects.length === 0 && (
              <Typography color="textSecondary">No AI projects yet</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notes
            </Typography>
            {notes.slice(0, 5).map((note) => (
              <Box key={note.id} sx={{ mb: 2, p: 1, borderLeft: 3, borderColor: 'success.main' }}>
                <Typography variant="subtitle1">{note.title}</Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {note.content.substring(0, 100)}...
                </Typography>
              </Box>
            ))}
            {notes.length === 0 && (
              <Typography color="textSecondary">No notes yet</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
