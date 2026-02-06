import { combineReducers } from 'redux';
import projectsReducer from './projectsReducer';
import notesReducer from './notesReducer';
import agentReducer from './agentReducer';

const rootReducer = combineReducers({
  projects: projectsReducer,
  notes: notesReducer,
  agent: agentReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
