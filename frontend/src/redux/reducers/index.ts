import { combineReducers } from 'redux';
import trackReducer from './trackReducer';
import djReducer from './djReducer';

const rootReducer = combineReducers({ trackReducer, djReducer });

export default rootReducer;