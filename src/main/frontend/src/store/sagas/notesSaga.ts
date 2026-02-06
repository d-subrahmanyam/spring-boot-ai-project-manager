import { call, put, takeLatest, CallEffect, PutEffect } from 'redux-saga/effects';
import { notesApi } from '../api';
import {
  FETCH_NOTES_REQUEST,
  CREATE_NOTE_REQUEST,
  UPDATE_NOTE_REQUEST,
  DELETE_NOTE_REQUEST,
  fetchNotesSuccess,
  fetchNotesFailure,
  createNoteSuccess,
  createNoteFailure,
  updateNoteSuccess,
  updateNoteFailure,
  deleteNoteSuccess,
  deleteNoteFailure,
  Note,
} from '../actions';
import { AxiosResponse } from 'axios';

function* fetchNotesSaga(): Generator<
  CallEffect<AxiosResponse<Note[]>> | PutEffect,
  void,
  AxiosResponse<Note[]>
> {
  try {
    const response = yield call(notesApi.fetchNotes);
    yield put(fetchNotesSuccess(response.data));
  } catch (error) {
    yield put(fetchNotesFailure((error as Error).message));
  }
}

function* createNoteSaga(
  action: ReturnType<typeof import('../actions').createNoteRequest>
): Generator<CallEffect<AxiosResponse<Note>> | PutEffect, void, AxiosResponse<Note>> {
  try {
    const response = yield call(notesApi.createNote, action.payload);
    yield put(createNoteSuccess(response.data));
  } catch (error) {
    yield put(createNoteFailure((error as Error).message));
  }
}

function* updateNoteSaga(
  action: ReturnType<typeof import('../actions').updateNoteRequest>
): Generator<CallEffect<AxiosResponse<Note>> | PutEffect, void, AxiosResponse<Note>> {
  try {
    const { id, ...noteData } = action.payload;
    const response = yield call(notesApi.updateNote, id, noteData);
    yield put(updateNoteSuccess(response.data));
  } catch (error) {
    yield put(updateNoteFailure((error as Error).message));
  }
}

function* deleteNoteSaga(
  action: ReturnType<typeof import('../actions').deleteNoteRequest>
): Generator<CallEffect<AxiosResponse<void>> | PutEffect, void, AxiosResponse<void>> {
  try {
    yield call(notesApi.deleteNote, action.payload);
    yield put(deleteNoteSuccess(action.payload));
  } catch (error) {
    yield put(deleteNoteFailure((error as Error).message));
  }
}

export default function* notesSaga() {
  yield takeLatest(FETCH_NOTES_REQUEST, fetchNotesSaga);
  yield takeLatest(CREATE_NOTE_REQUEST, createNoteSaga);
  yield takeLatest(UPDATE_NOTE_REQUEST, updateNoteSaga);
  yield takeLatest(DELETE_NOTE_REQUEST, deleteNoteSaga);
}
