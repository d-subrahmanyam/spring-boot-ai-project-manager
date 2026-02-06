import { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { PlusIcon } from '@heroicons/react/24/outline';
import { fetchProjectsRequest } from '../store/actions';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const Projects: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
        >
          New Project
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {project.description}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">View</Button>
                  <Button size="small">Edit</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {projects.length === 0 && (
            <Grid item xs={12}>
              <Typography color="textSecondary" align="center">
                No projects found. Create your first project!
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Projects;
