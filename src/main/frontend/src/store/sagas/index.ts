import { all, fork } from 'redux-saga/effects';
import projectsSaga from './projectsSaga';
import notesSaga from './notesSaga';
import {
  watchFetchAgentProjects,
  watchFetchProjectTasks,
  watchExecuteTask,
  watchCreateProject,
} from './agentSaga';

export default function* rootSaga() {
  yield all([
    fork(projectsSaga),
    fork(notesSaga),
    fork(watchFetchAgentProjects),
    fork(watchFetchProjectTasks),
    fork(watchExecuteTask),
    fork(watchCreateProject),
  ]);
}
