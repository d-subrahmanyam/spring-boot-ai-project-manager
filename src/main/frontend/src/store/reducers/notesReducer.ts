import {
  FETCH_NOTES_REQUEST,
  FETCH_NOTES_SUCCESS,
  FETCH_NOTES_FAILURE,
  CREATE_NOTE_REQUEST,
  CREATE_NOTE_SUCCESS,
  CREATE_NOTE_FAILURE,
  UPDATE_NOTE_REQUEST,
  UPDATE_NOTE_SUCCESS,
  UPDATE_NOTE_FAILURE,
  DELETE_NOTE_REQUEST,
  DELETE_NOTE_SUCCESS,
  DELETE_NOTE_FAILURE,
  Note,
  NoteActionTypes,
} from '../actions';

export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
};

const notesReducer = (
  state = initialState,
  action: NoteActionTypes
): NotesState => {
  switch (action.type) {
    case FETCH_NOTES_REQUEST:
    case CREATE_NOTE_REQUEST:
    case UPDATE_NOTE_REQUEST:
    case DELETE_NOTE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_NOTES_SUCCESS:
      return {
        ...state,
        loading: false,
        notes: action.payload,
      };
    case CREATE_NOTE_SUCCESS:
      return {
        ...state,
        loading: false,
        notes: [...state.notes, action.payload],
      };
    case UPDATE_NOTE_SUCCESS:
      return {
        ...state,
        loading: false,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case DELETE_NOTE_SUCCESS:
      return {
        ...state,
        loading: false,
        notes: state.notes.filter((note) => note.id !== action.payload),
      };
    case FETCH_NOTES_FAILURE:
    case CREATE_NOTE_FAILURE:
    case UPDATE_NOTE_FAILURE:
    case DELETE_NOTE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default notesReducer;
