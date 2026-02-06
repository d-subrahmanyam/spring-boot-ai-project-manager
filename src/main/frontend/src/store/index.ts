import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer as any,
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;

export default store;
