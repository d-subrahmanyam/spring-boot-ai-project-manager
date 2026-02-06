// Agent API Types
export interface Task {
  id: string;
  description: string;
  type: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  result: string | null;
  assignedAgent: string | null;
  tokensUsed: number | null;
}

export interface ProjectInfo {
  assignedCount: number;
  completedCount: number;
  projectId: string;
  title: string;
  description: string;
  taskCount: number;
  tokensUsed?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSummary {
  projectId: string;
  taskCount: number;
  completedCount: number;
  assignedCount: number;
}

export interface ExecuteTaskResponse {
  taskId: string;
  description: string;
  assignedAgent: string;
  status: string;
  result: string;
  tokensUsed?: number;
}

// Action Types
export const FETCH_AGENT_PROJECTS_REQUEST = 'FETCH_AGENT_PROJECTS_REQUEST';
export const FETCH_AGENT_PROJECTS_SUCCESS = 'FETCH_AGENT_PROJECTS_SUCCESS';
export const FETCH_AGENT_PROJECTS_FAILURE = 'FETCH_AGENT_PROJECTS_FAILURE';

export const FETCH_PROJECT_TASKS_REQUEST = 'FETCH_PROJECT_TASKS_REQUEST';
export const FETCH_PROJECT_TASKS_SUCCESS = 'FETCH_PROJECT_TASKS_SUCCESS';
export const FETCH_PROJECT_TASKS_FAILURE = 'FETCH_PROJECT_TASKS_FAILURE';

export const EXECUTE_TASK_REQUEST = 'EXECUTE_TASK_REQUEST';
export const EXECUTE_TASK_SUCCESS = 'EXECUTE_TASK_SUCCESS';
export const EXECUTE_TASK_FAILURE = 'EXECUTE_TASK_FAILURE';

export const EXECUTE_TASK_STREAM_START = 'EXECUTE_TASK_STREAM_START';
export const EXECUTE_TASK_STREAM_CHUNK = 'EXECUTE_TASK_STREAM_CHUNK';
export const EXECUTE_TASK_STREAM_COMPLETE = 'EXECUTE_TASK_STREAM_COMPLETE';
export const EXECUTE_TASK_STREAM_ERROR = 'EXECUTE_TASK_STREAM_ERROR';

export const CREATE_PROJECT_REQUEST = 'CREATE_PROJECT_REQUEST';
export const CREATE_PROJECT_SUCCESS = 'CREATE_PROJECT_SUCCESS';
export const CREATE_PROJECT_FAILURE = 'CREATE_PROJECT_FAILURE';

// Action Interfaces
interface FetchAgentProjectsRequestAction {
  type: typeof FETCH_AGENT_PROJECTS_REQUEST;
}

interface FetchAgentProjectsSuccessAction {
  type: typeof FETCH_AGENT_PROJECTS_SUCCESS;
  payload: {
    projects: string[];
    projectInfo: Record<string, ProjectInfo>;
  };
}

interface FetchAgentProjectsFailureAction {
  type: typeof FETCH_AGENT_PROJECTS_FAILURE;
  payload: string;
}

interface FetchProjectTasksRequestAction {
  type: typeof FETCH_PROJECT_TASKS_REQUEST;
  payload: string; // projectId
}

interface FetchProjectTasksSuccessAction {
  type: typeof FETCH_PROJECT_TASKS_SUCCESS;
  payload: {
    projectId: string;
    tasks: Task[];
    projectInfo: ProjectInfo;
  };
}

interface FetchProjectTasksFailureAction {
  type: typeof FETCH_PROJECT_TASKS_FAILURE;
  payload: string;
}

interface ExecuteTaskRequestAction {
  type: typeof EXECUTE_TASK_REQUEST;
  payload: string; // taskId
}

interface ExecuteTaskSuccessAction {
  type: typeof EXECUTE_TASK_SUCCESS;
  payload: ExecuteTaskResponse;
}

interface ExecuteTaskFailureAction {
  type: typeof EXECUTE_TASK_FAILURE;
  payload: string;
}

interface CreateProjectRequestAction {
  type: typeof CREATE_PROJECT_REQUEST;
  payload: string; // project request description
}

interface CreateProjectSuccessAction {
  type: typeof CREATE_PROJECT_SUCCESS;
  payload: {
    projectId: string;
    tasks: Task[];
  };
}

interface CreateProjectFailureAction {
  type: typeof CREATE_PROJECT_FAILURE;
  payload: string;
}

interface ExecuteTaskStreamStartAction {
  type: typeof EXECUTE_TASK_STREAM_START;
  payload: string; // taskId
}

interface ExecuteTaskStreamChunkAction {
  type: typeof EXECUTE_TASK_STREAM_CHUNK;
  payload: {
    taskId: string;
    content: string;
  };
}

interface ExecuteTaskStreamCompleteAction {
  type: typeof EXECUTE_TASK_STREAM_COMPLETE;
  payload: string; // taskId
}

interface ExecuteTaskStreamErrorAction {
  type: typeof EXECUTE_TASK_STREAM_ERROR;
  payload: {
    taskId: string;
    error: string;
  };
}

export type AgentActionTypes =
  | FetchAgentProjectsRequestAction
  | FetchAgentProjectsSuccessAction
  | FetchAgentProjectsFailureAction
  | FetchProjectTasksRequestAction
  | FetchProjectTasksSuccessAction
  | FetchProjectTasksFailureAction
  | ExecuteTaskRequestAction
  | ExecuteTaskSuccessAction
  | ExecuteTaskFailureAction
  | ExecuteTaskStreamStartAction
  | ExecuteTaskStreamChunkAction
  | ExecuteTaskStreamCompleteAction
  | ExecuteTaskStreamErrorAction
  | CreateProjectRequestAction
  | CreateProjectSuccessAction
  | CreateProjectFailureAction;

// Action Creators
export const fetchAgentProjectsRequest = (): FetchAgentProjectsRequestAction => ({
  type: FETCH_AGENT_PROJECTS_REQUEST,
});

export const fetchAgentProjectsSuccess = (
  projects: string[],
  projectInfo: Record<string, ProjectInfo>
): FetchAgentProjectsSuccessAction => ({
  type: FETCH_AGENT_PROJECTS_SUCCESS,
  payload: { projects, projectInfo },
});

export const fetchAgentProjectsFailure = (
  error: string
): FetchAgentProjectsFailureAction => ({
  type: FETCH_AGENT_PROJECTS_FAILURE,
  payload: error,
});

export const fetchProjectTasksRequest = (
    projectId: string | null
): FetchProjectTasksRequestAction => <FetchProjectTasksRequestAction>({
    type: FETCH_PROJECT_TASKS_REQUEST,
    payload: projectId,
});

export const fetchProjectTasksSuccess = (
  projectId: string,
  tasks: Task[],
  projectInfo: ProjectInfo
): FetchProjectTasksSuccessAction => ({
  type: FETCH_PROJECT_TASKS_SUCCESS,
  payload: { projectId, tasks, projectInfo },
});

export const fetchProjectTasksFailure = (
  error: string
): FetchProjectTasksFailureAction => ({
  type: FETCH_PROJECT_TASKS_FAILURE,
  payload: error,
});

export const executeTaskRequest = (taskId: string): ExecuteTaskRequestAction => ({
  type: EXECUTE_TASK_REQUEST,
  payload: taskId,
});

export const executeTaskSuccess = (
  response: ExecuteTaskResponse
): ExecuteTaskSuccessAction => ({
  type: EXECUTE_TASK_SUCCESS,
  payload: response,
});

export const executeTaskFailure = (error: string): ExecuteTaskFailureAction => ({
  type: EXECUTE_TASK_FAILURE,
  payload: error,
});

export const createProjectRequest = (
  projectRequest: string
): CreateProjectRequestAction => ({
  type: CREATE_PROJECT_REQUEST,
  payload: projectRequest,
});

export const createProjectSuccess = (
  projectId: string,
  tasks: Task[]
): CreateProjectSuccessAction => ({
  type: CREATE_PROJECT_SUCCESS,
  payload: { projectId, tasks },
});

export const createProjectFailure = (
  error: string
): CreateProjectFailureAction => ({
  type: CREATE_PROJECT_FAILURE,
  payload: error,
});

export const executeTaskStreamStart = (taskId: string): ExecuteTaskStreamStartAction => ({
  type: EXECUTE_TASK_STREAM_START,
  payload: taskId,
});

export const executeTaskStreamChunk = (
  taskId: string,
  content: string
): ExecuteTaskStreamChunkAction => ({
  type: EXECUTE_TASK_STREAM_CHUNK,
  payload: { taskId, content },
});

export const executeTaskStreamComplete = (taskId: string): ExecuteTaskStreamCompleteAction => ({
  type: EXECUTE_TASK_STREAM_COMPLETE,
  payload: taskId,
});

export const executeTaskStreamError = (
  taskId: string,
  error: string
): ExecuteTaskStreamErrorAction => ({
  type: EXECUTE_TASK_STREAM_ERROR,
  payload: { taskId, error },
});

