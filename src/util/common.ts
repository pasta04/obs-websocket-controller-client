import { Vibration } from 'react-native';

/**
 * JSONの取得
 * @param url 取得先のURL
 * @return JSONオブジェクト
 * @throws 通信エラー
 * @throws JSON変換エラー
 */
export const fetchJson = async (url: string) => {
  try {
    const result = await fetch(url);
    const config = await result.json();
    return config;
  } catch (e) {
    console.error(e);
    throw new Error('通信エラーが発生しました。');
  }
};

export const postJson = async (url: string, body: object) => {
  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await result.json();
  } catch (error) {
    console.error(error);
    throw new Error('通信エラーが発生しました。');
  }
};

export const postFile = async (url: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append(file.name, file);

    const result = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return await result.json();
  } catch (error) {
    throw new Error('通信エラーが発生しました。');
  }
};

export const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

const ONE_SECOND_IN_MS = 1000;
/** ちょっと振動する */
export const vibe = async () => {
  Vibration.vibrate(0.3 * ONE_SECOND_IN_MS);
};
export const longvibe = async () => {
  Vibration.vibrate(0.6 * ONE_SECOND_IN_MS);
};
