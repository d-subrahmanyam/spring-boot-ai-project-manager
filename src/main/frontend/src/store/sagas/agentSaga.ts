import { call, put, takeEvery } from 'redux-saga/effects';
import {
  FETCH_AGENT_PROJECTS_REQUEST,
  FETCH_PROJECT_TASKS_REQUEST,
  EXECUTE_TASK_REQUEST,
  CREATE_PROJECT_REQUEST,
  fetchAgentProjectsSuccess,
  fetchAgentProjectsFailure,
  fetchProjectTasksSuccess,
  fetchProjectTasksFailure,
  executeTaskSuccess,
  executeTaskFailure,
  createProjectSuccess,
  createProjectFailure,
  Task,
  ProjectInfo,
  ExecuteTaskResponse,
} from '../actions/agentActions';

const API_BASE_URL = '/api/agent';
// API Functions
function* fetchAgentProjects() {
  try {
    const response: Response = yield call(fetch, `${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    const projectSummaries: any[] = yield call([response, 'json']);

    // Extract project IDs
    const projectIds = projectSummaries.map(p => p.projectId);

    // Store project info for each project
    const projectInfoMap: Record<string, any> = {};
    projectSummaries.forEach(summary => {
      projectInfoMap[summary.projectId] = {
        projectId: summary.projectId,
        title: summary.title,
        description: `${summary.taskCount} tasks`,
        taskCount: summary.taskCount,
        completedCount: summary.completedCount || 0,
        assignedCount: summary.assignedCount || 0,
        tokensUsed: summary.tokensUsed,
        createdAt: summary.createdAt,
        updatedAt: summary.updatedAt,
      };
    });

    yield put(fetchAgentProjectsSuccess(projectIds, projectInfoMap));
  } catch (error: any) {
    yield put(fetchAgentProjectsFailure(error.message || 'Failed to fetch projects'));
  }
}

function* fetchProjectTasks(action: { type: string; payload: string }) {
  try {
    const projectId = action.payload;

    // Fetch project info
    const infoResponse: Response = yield call(
      fetch,
      `${API_BASE_URL}/projects/${projectId}/info`
    );
    if (!infoResponse.ok) {
      throw new Error('Failed to fetch project info');
    }
    const projectInfo: ProjectInfo = yield call([infoResponse, 'json']);

    // Fetch tasks
    const response: Response = yield call(
      fetch,
      `${API_BASE_URL}/projects/${projectId}/tasks`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const tasks: Task[] = yield call([response, 'json']);

    yield put(fetchProjectTasksSuccess(projectId, tasks, projectInfo));
  } catch (error: any) {
    yield put(fetchProjectTasksFailure(error.message || 'Failed to fetch tasks'));
  }
}

function* executeTask(action: { type: string; payload: string }) {
  try {
    const taskId = action.payload;
    const response: Response = yield call(
      fetch,
      `${API_BASE_URL}/tasks/${taskId}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to execute task');
    }
    const result: ExecuteTaskResponse = yield call([response, 'json']);
    yield put(executeTaskSuccess(result));
  } catch (error: any) {
    yield put(executeTaskFailure(error.message || 'Failed to execute task'));
  }
}

function* createProject(action: { type: string; payload: string }) {
  try {
    const projectRequest = action.payload;
    const response: Response = yield call(
      fetch,
      `${API_BASE_URL}/projects?projectRequest=${encodeURIComponent(projectRequest)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    const result: { project: { id: string; title: string }; tasks: Task[] } = yield call([response, 'json']);
    yield put(createProjectSuccess(result.project.id, result.tasks));
  } catch (error: any) {
    yield put(createProjectFailure(error.message || 'Failed to create project'));
  }
}

// Watcher Sagas
export function* watchFetchAgentProjects() {
  yield takeEvery(FETCH_AGENT_PROJECTS_REQUEST, fetchAgentProjects);
}

export function* watchFetchProjectTasks() {
  yield takeEvery(FETCH_PROJECT_TASKS_REQUEST, fetchProjectTasks);
}

export function* watchExecuteTask() {
  yield takeEvery(EXECUTE_TASK_REQUEST, executeTask);
}

export function* watchCreateProject() {
  yield takeEvery(CREATE_PROJECT_REQUEST, createProject);
}
