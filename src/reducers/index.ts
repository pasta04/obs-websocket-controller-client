import * as actions from '../actions';

import { ActionType, getType } from 'typesafe-actions';
import { GlobalState } from '../global';

type Action = ActionType<typeof actions>;

export const initialState: GlobalState = {
  notify: {
    show: false,
    type: 'info',
    message: '',
    closable: true,
  },
  dialog: {
    show: false,
    confirm: false,
    type: 'info',
    message: '',
    detail: '',
  },
  config: {
    theme: 'default',
    obswsUrl: '',
    obswsAuth: false,
    obswsPassword: '',
    managerwsUrl: '',
    iconSize: 32,
    micSrcName: 'マイク',
  },
  disp: 'main',
  obs: {
    connection: false,
    connectionInfo: '',
  },
  obsStatus: {
    pulse: false,
    stats: {
      fps: 0,
      'render-total-frames': 0,
      'render-missed-frames': 0,
      'output-total-frames': 0,
      'output-skipped-frames': 0,
      'average-frame-time': 0,
      'cpu-usage': 0,
      'memory-usage': 0,
      'free-disk-space': 0,
    },
  },
  manager: {
    connection: false,
    connectionInfo: '',
  },
  data: [
    // {
    //   id: '1',
    //   icon: '',
    //   title: 'お待ち下さい',
    //   command: [
    //     {
    //       target: 'obsws',
    //       type: 'changeScene',
    //       data: 'お待ちください',
    //     },
    //   ],
    // },
    // {
    //   id: '2',
    //   icon: '',
    //   title: 'おわり',
    //   command: [
    //     {
    //       target: 'obsws',
    //       type: 'changeScene',
    //       data: 'おわり',
    //     },
    //   ],
    // },
    // {
    //   id: '3',
    //   icon: '',
    //   title: '16_9ゲー',
    //   command: [
    //     {
    //       target: 'obsws',
    //       type: 'changeScene',
    //       data: '16_9ゲー',
    //     },
    //   ],
    // },
    {
      id: '4',
      icon: '',
      title: 'マイクミュート切り替え',
      command: [
        {
          target: 'obsws',
          type: 'toggleMute',
          data: 'マイク',
        },
      ],
    },
  ],
};

const reducer = (state: GlobalState = initialState, action: Action): GlobalState => {
  switch (action.type) {
    case getType(actions.changeNotify): {
      return { ...state, notify: { ...action.payload } };
    }
    case getType(actions.closeNotify): {
      return { ...state, notify: { ...state.notify, show: false } };
    }
    case getType(actions.changeDialog): {
      if (action.payload.show === false) {
        return { ...state, dialog: initialState.dialog };
      } else {
        return { ...state, dialog: { ...state.dialog, ...action.payload } };
      }
    }
    case getType(actions.closeDialog): {
      return { ...state, dialog: { ...initialState.dialog } };
    }
    case getType(actions.storeConfig): {
      return { ...state, config: action.payload };
    }
    case getType(actions.updateCommandList): {
      return { ...state, data: action.payload };
    }
    case getType(actions.updateObsHeatbeat): {
      return { ...state, obsStatus: action.payload };
    }
    case getType(actions.updateObsConnectionStatus): {
      return { ...state, obs: action.payload };
    }
    default:
      return state;
  }
};

export default reducer;
