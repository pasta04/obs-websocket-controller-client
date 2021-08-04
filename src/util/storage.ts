import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCALSTORAGE_KEY_CONFIG = 'config';
const LOCALSTORAGE_KEY_COMMAND = 'command';

/** ローカルストレージからデータ読み込み */
export const loadStorage = async () => {
  let config = null;
  // config
  try {
    const str = await AsyncStorage.getItem(LOCALSTORAGE_KEY_CONFIG);
    if (str) {
      config = JSON.parse(str);
    }
  } catch (e) {
    console.error(e);
  }

  // data
  let data;
  try {
    const str = await AsyncStorage.getItem(LOCALSTORAGE_KEY_COMMAND);
    if (str) {
      data = JSON.parse(str);
    }
  } catch (e) {
    console.error(e);
  }
  return { config, data };
};

export const saveLocalStorageConfig = async (config: any) => {
  AsyncStorage.setItem(LOCALSTORAGE_KEY_CONFIG, JSON.stringify(config));
};

export const saveLocalStorageCommand = async (command: any) => {
  AsyncStorage.setItem(LOCALSTORAGE_KEY_COMMAND, JSON.stringify(command));
};

export const saveAny = async (key: string, value: string) => {
  AsyncStorage.setItem(key, value);
};

export const loadAny = async (key: string) => {
  return AsyncStorage.getItem(key);
};
