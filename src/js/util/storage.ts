import { GlobalState } from '../types/global';

const LOCALSTORAGE_KEY_CONFIG = 'config';
const LOCALSTORAGE_KEY_COMMAND = 'command';

/** ローカルストレージからデータ読み込み */
export const loadStorage = () => {
  let config = null;
  // config
  try {
    const str = window.localStorage.getItem(LOCALSTORAGE_KEY_CONFIG);
    if (str) {
      config = JSON.parse(str);
    }
  } catch (e) {
    console.error(e);
  }

  // data
  let data;
  try {
    const str = window.localStorage.getItem(LOCALSTORAGE_KEY_COMMAND);
    if (str) {
      data = JSON.parse(str);
    }
  } catch (e) {
    console.error(e);
  }
  return { config: config as GlobalState['config'], data: data as GlobalState['data'] };
};

export const saveLocalStorageConfig = (config: GlobalState['config']) => {
  // const config: GlobalState['config'] = {
  //   theme: 'default',
  //   obswsUrl: 'localhost:4444',
  //   obswsAuth: false,
  //   obswsPassword: '',
  //   managerwsUrl: 'localhost:10000',
  //   iconSize: 64,
  // };
  window.localStorage.setItem(LOCALSTORAGE_KEY_CONFIG, JSON.stringify(config));
};

export const saveLocalStorageCommand = (command: GlobalState['data']) => {
  window.localStorage.setItem(LOCALSTORAGE_KEY_COMMAND, JSON.stringify(command));
};
