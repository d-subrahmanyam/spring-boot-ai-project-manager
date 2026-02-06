import { call, put, takeLatest, CallEffect, PutEffect } from 'redux-saga/effects';
import { projectsApi } from '../api';
import {
  FETCH_PROJECTS_REQUEST,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  Project,
} from '../actions';
import { AxiosResponse } from 'axios';

function* fetchProjectsSaga(): Generator<
  CallEffect<AxiosResponse<Project[]>> | PutEffect,
  void,
  AxiosResponse<Project[]>
> {
  try {
    const response = yield call(projectsApi.fetchProjects);
    yield put(fetchProjectsSuccess(response.data));
  } catch (error) {
    yield put(fetchProjectsFailure((error as Error).message));
  }
}

export default function* projectsSaga() {
  yield takeLatest(FETCH_PROJECTS_REQUEST, fetchProjectsSaga);
}
