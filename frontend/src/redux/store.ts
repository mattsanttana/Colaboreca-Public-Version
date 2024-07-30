import { legacy_createStore as createStore } from 'redux';
import { AnyAction } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistPartial } from 'redux-persist/es/persistReducer';
import rootReducer from './reducers';

export type RootState = {
  trackReducer: { token: string };
  djReducer: { token: string };
} & PersistPartial;

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = createStore<RootState, AnyAction>(persistedReducer, composeWithDevTools());

const persistor = persistStore(store)

export { store, persistor };