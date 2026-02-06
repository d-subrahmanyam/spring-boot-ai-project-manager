// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// Action Types
export const FETCH_PROJECTS_REQUEST = 'FETCH_PROJECTS_REQUEST';
export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS';
export const FETCH_PROJECTS_FAILURE = 'FETCH_PROJECTS_FAILURE';

export const CREATE_NOTE_REQUEST = 'CREATE_NOTE_REQUEST';
export const CREATE_NOTE_SUCCESS = 'CREATE_NOTE_SUCCESS';
export const CREATE_NOTE_FAILURE = 'CREATE_NOTE_FAILURE';

export const UPDATE_NOTE_REQUEST = 'UPDATE_NOTE_REQUEST';
export const UPDATE_NOTE_SUCCESS = 'UPDATE_NOTE_SUCCESS';
export const UPDATE_NOTE_FAILURE = 'UPDATE_NOTE_FAILURE';

export const DELETE_NOTE_REQUEST = 'DELETE_NOTE_REQUEST';
export const DELETE_NOTE_SUCCESS = 'DELETE_NOTE_SUCCESS';
export const DELETE_NOTE_FAILURE = 'DELETE_NOTE_FAILURE';

export const FETCH_NOTES_REQUEST = 'FETCH_NOTES_REQUEST';
export const FETCH_NOTES_SUCCESS = 'FETCH_NOTES_SUCCESS';
export const FETCH_NOTES_FAILURE = 'FETCH_NOTES_FAILURE';

// Action Interfaces
interface FetchProjectsRequestAction {
  type: typeof FETCH_PROJECTS_REQUEST;
}

interface FetchProjectsSuccessAction {
  type: typeof FETCH_PROJECTS_SUCCESS;
  payload: Project[];
}

interface FetchProjectsFailureAction {
  type: typeof FETCH_PROJECTS_FAILURE;
  payload: string;
}

interface FetchNotesRequestAction {
  type: typeof FETCH_NOTES_REQUEST;
}

interface FetchNotesSuccessAction {
  type: typeof FETCH_NOTES_SUCCESS;
  payload: Note[];
}

interface FetchNotesFailureAction {
  type: typeof FETCH_NOTES_FAILURE;
  payload: string;
}

interface CreateNoteRequestAction {
  type: typeof CREATE_NOTE_REQUEST;
  payload: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
}

interface CreateNoteSuccessAction {
  type: typeof CREATE_NOTE_SUCCESS;
  payload: Note;
}

interface CreateNoteFailureAction {
  type: typeof CREATE_NOTE_FAILURE;
  payload: string;
}

interface UpdateNoteRequestAction {
  type: typeof UPDATE_NOTE_REQUEST;
  payload: Note;
}

interface UpdateNoteSuccessAction {
  type: typeof UPDATE_NOTE_SUCCESS;
  payload: Note;
}

interface UpdateNoteFailureAction {
  type: typeof UPDATE_NOTE_FAILURE;
  payload: string;
}

interface DeleteNoteRequestAction {
  type: typeof DELETE_NOTE_REQUEST;
  payload: string;
}

interface DeleteNoteSuccessAction {
  type: typeof DELETE_NOTE_SUCCESS;
  payload: string;
}

interface DeleteNoteFailureAction {
  type: typeof DELETE_NOTE_FAILURE;
  payload: string;
}

export type ProjectActionTypes =
  | FetchProjectsRequestAction
  | FetchProjectsSuccessAction
  | FetchProjectsFailureAction;

export type NoteActionTypes =
  | FetchNotesRequestAction
  | FetchNotesSuccessAction
  | FetchNotesFailureAction
  | CreateNoteRequestAction
  | CreateNoteSuccessAction
  | CreateNoteFailureAction
  | UpdateNoteRequestAction
  | UpdateNoteSuccessAction
  | UpdateNoteFailureAction
  | DeleteNoteRequestAction
  | DeleteNoteSuccessAction
  | DeleteNoteFailureAction;

// Action Creators
export const fetchProjectsRequest = (): FetchProjectsRequestAction => ({
  type: FETCH_PROJECTS_REQUEST,
});

export const fetchProjectsSuccess = (projects: Project[]): FetchProjectsSuccessAction => ({
  type: FETCH_PROJECTS_SUCCESS,
  payload: projects,
});

export const fetchProjectsFailure = (error: string): FetchProjectsFailureAction => ({
  type: FETCH_PROJECTS_FAILURE,
  payload: error,
});

export const fetchNotesRequest = (): FetchNotesRequestAction => ({
  type: FETCH_NOTES_REQUEST,
});

export const fetchNotesSuccess = (notes: Note[]): FetchNotesSuccessAction => ({
  type: FETCH_NOTES_SUCCESS,
  payload: notes,
});

export const fetchNotesFailure = (error: string): FetchNotesFailureAction => ({
  type: FETCH_NOTES_FAILURE,
  payload: error,
});

export const createNoteRequest = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): CreateNoteRequestAction => ({
  type: CREATE_NOTE_REQUEST,
  payload: note,
});

export const createNoteSuccess = (note: Note): CreateNoteSuccessAction => ({
  type: CREATE_NOTE_SUCCESS,
  payload: note,
});

export const createNoteFailure = (error: string): CreateNoteFailureAction => ({
  type: CREATE_NOTE_FAILURE,
  payload: error,
});

export const updateNoteRequest = (note: Note): UpdateNoteRequestAction => ({
  type: UPDATE_NOTE_REQUEST,
  payload: note,
});

export const updateNoteSuccess = (note: Note): UpdateNoteSuccessAction => ({
  type: UPDATE_NOTE_SUCCESS,
  payload: note,
});

export const updateNoteFailure = (error: string): UpdateNoteFailureAction => ({
  type: UPDATE_NOTE_FAILURE,
  payload: error,
});

export const deleteNoteRequest = (id: string): DeleteNoteRequestAction => ({
  type: DELETE_NOTE_REQUEST,
  payload: id,
});

export const deleteNoteSuccess = (id: string): DeleteNoteSuccessAction => ({
  type: DELETE_NOTE_SUCCESS,
  payload: id,
});

export const deleteNoteFailure = (error: string): DeleteNoteFailureAction => ({
  type: DELETE_NOTE_FAILURE,
  payload: error,
});
