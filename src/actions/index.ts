import { createAction } from 'typesafe-actions';
import { DialogState, GlobalState } from '../global';

const STORE_CONFIG = 'STORE_CONFIG';
/** 設定を反映 */
export const storeConfig = createAction(STORE_CONFIG, (action) => {
  return (config: GlobalState['config']) => action(config);
});

const OPEN_NOTIFY = 'OPEN_NOTIFY';
/** 通知欄表示 */
export const changeNotify = createAction(OPEN_NOTIFY, (action) => {
  return (show: boolean, type: 'info' | 'warning' | 'error', message: string, closable?: boolean) => action({ show, type, message, closable: closable === false ? false : true });
});

const CLOSE_NOTIFY = 'CLOSE_NOTIFY';
/** 通知欄閉じる */
export const closeNotify = createAction(CLOSE_NOTIFY);

const OPEN_DIALOG = 'OPEN_DIALOG';
/** ダイアログ表示 */
export const changeDialog = createAction(OPEN_DIALOG, (action) => {
  return (args: Partial<DialogState>) => action(args);
});

const CLOSE_DIALOG = 'CLOSE_DIALOG';
/** ダイアログ閉じる */
export const closeDialog = createAction(CLOSE_DIALOG);

const DIALOG_YES = 'DIALOG_YES';
/** ダイアログでYesを押す */
export const dialogYes = createAction(DIALOG_YES, (action) => {
  return (args: any) => action(args);
});

const DIALOG_NO = 'DIALOG_NO';
/** ダイアログでNoを押す */
export const dialogNo = createAction(DIALOG_NO, (action) => {
  return (args: any) => action(args);
});

const EXEC_ACTION_BUTTON = 'EXEC_ACTION_BUTTON';
/** ボタン押した */
export const execActionButton = createAction(EXEC_ACTION_BUTTON, (action) => {
  return (args: string) => action(args);
});

const CHANGE_THEME = 'CHANGE_THEME';
/** テーマ変更ボタン押した */
export const changeTheme = createAction(CHANGE_THEME, (action) => {
  return (args: GlobalState['config']['theme']) => action(args);
});

const CHANGE_SETTING = 'CHANGE_SETTING';
/** 設定変更ボタン押した */
export const changeSetting = createAction(CHANGE_SETTING, (action) => {
  return (args: GlobalState['config']) => action(args);
});

const UPDATE_COMMAND_LIST = 'UPDATE_COMMAND_LIST';
export const updateCommandList = createAction(UPDATE_COMMAND_LIST, (action) => {
  return (args: GlobalState['data']) => action(args);
});

const UPDATE_OBS_HEATBEAT = 'UPDATE_OBS_HEATBEAT';
export const updateObsHeatbeat = createAction(UPDATE_OBS_HEATBEAT, (action) => {
  return (args: GlobalState['obsStatus']) => action(args);
});

const UPDATE_OBS_CONNECTION_STATUS = 'UPDATE_OBS_CONNECTION_STATUS';
export const updateObsConnectionStatus = createAction(UPDATE_OBS_CONNECTION_STATUS, (action) => {
  return (args: GlobalState['obs']) => action(args);
});

const UPDATE_MANAGER_CONNECTION_STATUS = 'UPDATE_MANAGER_CONNECTION_STATUS';
export const updateManagerConnectionStatus = createAction(UPDATE_MANAGER_CONNECTION_STATUS, (action) => {
  return (args: GlobalState['manager']) => action(args);
});
