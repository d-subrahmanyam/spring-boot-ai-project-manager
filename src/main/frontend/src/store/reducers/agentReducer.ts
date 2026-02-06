import {
  FETCH_AGENT_PROJECTS_REQUEST,
  FETCH_AGENT_PROJECTS_SUCCESS,
  FETCH_AGENT_PROJECTS_FAILURE,
  FETCH_PROJECT_TASKS_REQUEST,
  FETCH_PROJECT_TASKS_SUCCESS,
  FETCH_PROJECT_TASKS_FAILURE,
  EXECUTE_TASK_REQUEST,
  EXECUTE_TASK_SUCCESS,
  EXECUTE_TASK_FAILURE,
  EXECUTE_TASK_STREAM_START,
  EXECUTE_TASK_STREAM_CHUNK,
  EXECUTE_TASK_STREAM_COMPLETE,
  EXECUTE_TASK_STREAM_ERROR,
  CREATE_PROJECT_REQUEST,
  CREATE_PROJECT_SUCCESS,
  CREATE_PROJECT_FAILURE,
  Task,
  ProjectInfo,
  AgentActionTypes,
} from '../actions/agentActions';

export interface AgentState {
  projects: string[];
  projectInfo: Record<string, ProjectInfo>;
  projectTasks: Record<string, Task[]>;
  loading: boolean;
  executingTasks: Record<string, boolean>;
  streamingTasks: Record<string, boolean>;
  streamingContent: Record<string, string>;
  error: string | null;
  creatingProject: boolean;
}

const initialState: AgentState = {
  projects: [],
  projectInfo: {},
  projectTasks: {},
  loading: false,
  executingTasks: {},
  streamingTasks: {},
  streamingContent: {},
  error: null,
  creatingProject: false,
};

const agentReducer = (
  state = initialState,
  action: AgentActionTypes
): AgentState => {
  switch (action.type) {
    case FETCH_AGENT_PROJECTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_AGENT_PROJECTS_SUCCESS:
      return {
        ...state,
        loading: false,
        projects: action.payload.projects,
        projectInfo: {
          ...state.projectInfo,
          ...action.payload.projectInfo,
        },
      };

    case FETCH_AGENT_PROJECTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_PROJECT_TASKS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PROJECT_TASKS_SUCCESS:
      return {
        ...state,
        loading: false,
        projectTasks: {
          ...state.projectTasks,
          [action.payload.projectId]: action.payload.tasks,
        },
        projectInfo: {
          ...state.projectInfo,
          [action.payload.projectId]: action.payload.projectInfo,
        },
      };

    case FETCH_PROJECT_TASKS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case EXECUTE_TASK_REQUEST:
      return {
        ...state,
        executingTasks: {
          ...state.executingTasks,
          [action.payload]: true,
        },
        error: null,
      };

    case EXECUTE_TASK_SUCCESS: {
      // Update the task in the project tasks
      const updatedProjectTasks = { ...state.projectTasks };
      Object.keys(updatedProjectTasks).forEach((projectId) => {
        const tasks = updatedProjectTasks[projectId];
        const taskIndex = tasks.findIndex((t) => t.id === action.payload.taskId);
        if (taskIndex !== -1) {
          updatedProjectTasks[projectId] = [
            ...tasks.slice(0, taskIndex),
            {
              ...tasks[taskIndex],
              status: action.payload.status as 'PENDING' | 'ASSIGNED' | 'COMPLETED',
              result: action.payload.result,
              tokensUsed: action.payload.tokensUsed || tasks[taskIndex].tokensUsed,
            },
            ...tasks.slice(taskIndex + 1),
          ];
        }
      });

      return {
        ...state,
        projectTasks: updatedProjectTasks,
        executingTasks: {
          ...state.executingTasks,
          [action.payload.taskId]: false,
        },
      };
    }

    case EXECUTE_TASK_FAILURE:
      return {
        ...state,
        error: action.payload,
        executingTasks: {},
      };

    case CREATE_PROJECT_REQUEST:
      return {
        ...state,
        creatingProject: true,
        error: null,
      };

    case CREATE_PROJECT_SUCCESS:
      return {
        ...state,
        creatingProject: false,
        projects: [...state.projects, action.payload.projectId],
        projectTasks: {
          ...state.projectTasks,
          [action.payload.projectId]: action.payload.tasks,
        },
      };

    case CREATE_PROJECT_FAILURE:
      return {
        ...state,
        creatingProject: false,
        error: action.payload,
      };

    case EXECUTE_TASK_STREAM_START:
      return {
        ...state,
        streamingTasks: {
          ...state.streamingTasks,
          [action.payload]: true,
        },
        streamingContent: {
          ...state.streamingContent,
          [action.payload]: '',
        },
        error: null,
      };

    case EXECUTE_TASK_STREAM_CHUNK: {
      return {
        ...state,
        streamingContent: {
          ...state.streamingContent,
          [action.payload.taskId]: action.payload.content,
        },
      };
    }

    case EXECUTE_TASK_STREAM_COMPLETE: {
      const taskId = action.payload;
      const finalContent = state.streamingContent[taskId] || '';

      // Update the task in projectTasks with the final result
      const updatedProjectTasks = { ...state.projectTasks };
      Object.keys(updatedProjectTasks).forEach((projectId) => {
        const tasks = updatedProjectTasks[projectId];
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          updatedProjectTasks[projectId] = [
            ...tasks.slice(0, taskIndex),
            {
              ...tasks[taskIndex],
              status: 'COMPLETED',
              result: finalContent,
            },
            ...tasks.slice(taskIndex + 1),
          ];
        }
      });

      return {
        ...state,
        streamingTasks: {
          ...state.streamingTasks,
          [taskId]: false,
        },
        projectTasks: updatedProjectTasks,
      };
    }

    case EXECUTE_TASK_STREAM_ERROR:
      return {
        ...state,
        streamingTasks: {
          ...state.streamingTasks,
          [action.payload.taskId]: false,
        },
        error: action.payload.error,
      };

    default:
      return state;
  }
};

export default agentReducer;
