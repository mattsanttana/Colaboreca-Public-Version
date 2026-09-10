import { SAVE_TOKEN } from '../actions';

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

const reducer = (
  state: State = INITIAL_STATE,
  action: Action
): State => {
  switch (action.type) {
    case SAVE_TOKEN:
      return {
        ...state,
        token: action.token || ''
      };
    default:
      return state;
  }
}

export default reducer;