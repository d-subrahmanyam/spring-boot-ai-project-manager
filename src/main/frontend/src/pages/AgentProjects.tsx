import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material';
import {
  ChevronDownIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAgentProjectsRequest,
  fetchProjectTasksRequest,
  createProjectRequest,
  executeTaskStreamStart,
  executeTaskStreamChunk,
  executeTaskStreamComplete,
  executeTaskStreamError,
} from '../store/actions/agentActions';
import { executeTaskStream } from '../store/api/streamingApi';
import ContentRenderer from '../components/ContentRenderer';

const AgentProjects: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    projects,
    projectInfo,
    projectTasks,
    loading,
    executingTasks,
    streamingTasks,
    streamingContent,
    error,
    creatingProject
  } = useAppSelector((state) => state.agent);

  const [expandedProject, setExpandedProject] = useState<string | false>(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projectRequest, setProjectRequest] = useState('');

  useEffect(() => {
    dispatch(fetchAgentProjectsRequest());
  }, [dispatch]);

  const handleProjectExpand = (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(false);
    } else {
      setExpandedProject(projectId);
      // Fetch tasks if not already loaded
      if (!projectTasks[projectId]) {
        dispatch(fetchProjectTasksRequest(projectId));
      }
    }
  };

  const handleTaskExpand = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleExecuteTask = (taskId: string) => {
    // Start streaming
    dispatch(executeTaskStreamStart(taskId));

    // Get the project ID for this task (to refetch later)
    let projectIdForTask: string | null = null;
    Object.keys(projectTasks).forEach((projectId) => {
      if (projectTasks[projectId].some((t) => t.id === taskId)) {
        projectIdForTask = projectId;
      }
    });

    // Use the streaming API
    executeTaskStream(
      taskId,
      (content) => {
        // Update content as chunks arrive
        dispatch(executeTaskStreamChunk(taskId, content));
      },
      () => {
        // Streaming complete
        dispatch(executeTaskStreamComplete(taskId));

        // Refetch tasks to get the saved result with token count from backend
        if (projectIdForTask) {
          setTimeout(() => {
            dispatch(fetchProjectTasksRequest(projectIdForTask));
          }, 1000); // Small delay to ensure backend has saved
        }
      },
      (error) => {
        // Streaming error
        dispatch(executeTaskStreamError(taskId, error.message));
      }
    );
  };

  const handleCreateProject = () => {
    if (projectRequest.trim()) {
      dispatch(createProjectRequest(projectRequest.trim()));
      setProjectRequest('');
      setCreateDialogOpen(false);
    }
  };

  const getTaskStats = (projectId: string) => {
    const tasks = projectTasks[projectId] || [];
    const info = projectInfo[projectId];

    // If project is expanded, use actual task data
    if (tasks.length > 0) {
      const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
      const assigned = tasks.filter((t) => t.status === 'ASSIGNED').length;
      const pending = tasks.filter((t) => t.status === 'PENDING').length;
      return { total: tasks.length, completed, assigned, pending };
    }

    // For collapsed projects, use projectInfo data from initial fetch
    if (info) {
      return {
        total: info.taskCount || 0,
        completed: info.completedCount || 0,
        assigned: info.assignedCount || 0,
        pending: 0,
      };
    }

    return { total: 0, completed: 0, assigned: 0, pending: 0 };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon style={{ width: 20, height: 20, color: '#4caf50' }} />;
      case 'ASSIGNED':
        return <ClockIcon style={{ width: 20, height: 20, color: '#ff9800' }} />;
      default:
        return <ClockIcon style={{ width: 20, height: 20, color: '#9e9e9e' }} />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SparklesIcon style={{ width: 32, height: 32 }} />
            Agent Projects
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            AI-powered project management with multi-agent orchestration
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={creatingProject}
        >
          New Project
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && projects.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <SparklesIcon style={{ width: 64, height: 64, margin: '0 auto', opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              No projects yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Create your first AI-powered project to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      {projects.map((projectId) => {
        const stats = getTaskStats(projectId);
        const tasks = projectTasks[projectId] || [];
        const info = projectInfo[projectId];
        const isExpanded = expandedProject === projectId;

        const displayTitle = info?.title || projectId;
        const displayDescription = info?.description || 'AI-powered project';

        return (
          <Accordion
            key={projectId}
            expanded={isExpanded}
            onChange={() => handleProjectExpand(projectId)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ChevronDownIcon style={{ width: 20, height: 20 }} />}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{displayTitle}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {displayDescription}
                    {info?.tokensUsed && (
                      <> • {info.tokensUsed.toLocaleString()} tokens</>
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    icon={<CheckCircleIcon style={{ width: 16, height: 16 }} />}
                    label={`${stats.completed} Completed`}
                    size="small"
                    color="success"
                  />
                  <Chip
                    icon={<ClockIcon style={{ width: 16, height: 16 }} />}
                    label={`${stats.assigned} Assigned`}
                    size="small"
                    color="warning"
                  />
                  {stats.pending > 0 && (
                    <Chip
                      label={`${stats.pending} Pending`}
                      size="small"
                      color="default"
                    />
                  )}
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              {loading && !tasks.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Box>
                  {tasks.map((task) => (
                    <Accordion
                      key={task.id}
                      expanded={expandedTasks[task.id] || false}
                      onChange={() => handleTaskExpand(task.id)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary
                        expandIcon={<ChevronDownIcon style={{ width: 16, height: 16 }} />}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                          {/* Status Icon */}
                          <Box>{getStatusIcon(task.status)}</Box>

                          {/* Task Summary */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              {task.description.length > 80
                                ? task.description.substring(0, 80) + '...'
                                : task.description}
                            </Typography>
                          </Box>

                          {/* Status Chips */}
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip
                              label={task.status}
                              size="small"
                              color={
                                task.status === 'COMPLETED'
                                  ? 'success'
                                  : task.status === 'ASSIGNED'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                            {task.assignedAgent && (
                              <Chip
                                label={task.assignedAgent}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Full Task Description */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              Task Description:
                            </Typography>
                            <ContentRenderer content={task.description} />
                          </Box>

                          {/* Task Metadata */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={task.status}
                              size="small"
                              color={
                                task.status === 'COMPLETED'
                                  ? 'success'
                                  : task.status === 'ASSIGNED'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                            {task.assignedAgent && (
                              <Chip
                                label={task.assignedAgent}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {task.type && task.type !== 'UNKNOWN' && (
                              <Chip label={task.type} size="small" variant="outlined" />
                            )}
                            {task.tokensUsed && (
                              <Chip
                                icon={<SparklesIcon style={{ width: 14, height: 14 }} />}
                                label={`${task.tokensUsed.toLocaleString()} tokens`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            )}
                          </Box>

                          {/* Task Result or Streaming Content */}
                          {streamingTasks[task.id] && (
                            <Box
                              sx={{
                                p: 2,
                                bgcolor: 'blue.50',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'blue.200',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CircularProgress size={16} />
                                <Typography
                                  variant="caption"
                                  color="primary"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Streaming response...
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 0.5 }}>
                                <ContentRenderer content={streamingContent[task.id] || ''} />
                              </Box>
                            </Box>
                          )}
                          {!streamingTasks[task.id] && task.result && (
                            <Box
                              sx={{
                                p: 2,
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ fontWeight: 600 }}
                              >
                                Result:
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <ContentRenderer content={task.result} />
                              </Box>
                            </Box>
                          )}

                          {/* Action Button */}
                          {task.status === 'ASSIGNED' && !streamingTasks[task.id] && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={
                                  executingTasks[task.id] || streamingTasks[task.id] ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <PlayIcon style={{ width: 16, height: 16 }} />
                                  )
                                }
                                onClick={() => handleExecuteTask(task.id)}
                                disabled={executingTasks[task.id] || streamingTasks[task.id]}
                              >
                                {streamingTasks[task.id] ? 'Streaming...' : 'Execute Task'}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Create Project Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !creatingProject && setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New AI Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Description"
            fullWidth
            multiline
            rows={4}
            value={projectRequest}
            onChange={(e) => setProjectRequest(e.target.value)}
            placeholder="Describe what you want to build... (e.g., 'Build a REST API for task management with CRUD operations')"
            disabled={creatingProject}
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            The AI agents will analyze your request and break it down into tasks
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={creatingProject}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!projectRequest.trim() || creatingProject}
            startIcon={
              creatingProject ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SparklesIcon style={{ width: 16, height: 16 }} />
              )
            }
          >
            {creatingProject ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentProjects;
