import { SAVE_DJ } from '../actions';

interface Action {
  type: string;
  token?: string;
}

interface State {
  token: string;
}

const INITIAL_STATE: State = {
  token: ''
};

const djReducer = (
  state: State = INITIAL_STATE,
  action: Action
): State => {
  switch (action.type) {
    case SAVE_DJ:
      return {
        ...state,
        token: action.token || ''
      };
    default:
      return state;
  }
}

export default djReducer;