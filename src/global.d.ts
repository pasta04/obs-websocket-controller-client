import OBSWebSocket, { OBSStats } from 'obs-websocket-js';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    obsWs: OBSWebSocket;
    managerWs: WebSocket;
  }
}

export type Scene = OBSWebSocket.Scene;

export type ArrayItem<T extends any[]> = T extends (infer Titem)[] ? Titem : never;
export type ResolvedType<T> = T extends Promise<infer R> ? R : T;
export type GeneratorType<T extends (...args: any) => any> = ResolvedType<ReturnType<T>>;

export type ThemeType = 'default' | 'dark';

export type OBSCommandType = 'changeScene' | 'startStream' | 'startRecording' | 'stopStream' | 'stopRecording' | 'toggleMute';

export type Command = OBSCommand | PCCommand;

export type OBSCommand = {
  /** 操作対象 */
  target: 'obsws';
  /** 操作種別 */
  type: OBSCommandType;
  data: string;
};

export type PCCommand = {
  /** 操作対象 */
  target: 'pc';
  type: 'exec';
  /** Managerで登録してあるID */
  data: string;
};

export type ControllData = {
  /** UUID */
  id: string;
  /** アイコン画像のbase64 */
  icon: string;
  /** タイトルテキスト */
  title: string;
  /** コマンドリスト */
  command: Command[];
};

export type Heartbeat = {
  'total-stream-frames'?: number;
  pulse: boolean;
  'current-scene'?: string;
  streaming?: boolean;
  'total-stream-time'?: number;
  'total-stream-bytes'?: number;
  'current-profile'?: string;
  recording?: boolean;
  'total-record-time'?: number;
  'total-record-bytes'?: number;
  'total-record-frames'?: number;
  stats: OBSStats;
};

export type DialogState = {
  /** ダイアログ表示 */
  show: boolean;
  /** 確認ダイアログか否か */
  confirm: boolean;
  /** ダイアログ種別 */
  type: 'info' | 'warning' | 'error';
  /** 簡潔に表すメッセージ */
  message: string;
  /** テキストボックスとかで表示したい詳細 */
  detail: string;
};

export type GlobalState = {
  /** 通知欄 */
  notify: {
    /** 表示可否 */
    show: boolean;
    /** 色 */
    type: 'info' | 'warning' | 'error';
    /** メッセージ */
    message: string;
    /** 手動で閉じられるか */
    closable: boolean;
  };
  /** ダイアログ */
  dialog: DialogState;
  /** ブラウザ内だけで完結する情報 */
  config: {
    theme: ThemeType;
    /** IP:Port */
    obswsUrl: string;
    /** WebSocket認証有無 */
    obswsAuth: boolean;
    /** WebSocketパスワード */
    obswsPassword: string;
    /** OBSのIP:Port */
    managerwsUrl: string;
    /** アイコンサイズ */
    iconSize: number;
    /** マイクのソース名 */
    micSrcName: string;
  };
  /** ボタン一覧 */
  data: ControllData[];

  /** 表示中の画面 */
  disp: 'main' | 'setting';

  obs: {
    /** OBSとの接続状態 */
    connection: boolean;
    /** 接続状態の補足情報 */
    connectionInfo: string;
  };
  obsStatus: Heartbeat;
  /** 設定を行うPC */
  manager: {
    /** 接続状態 */
    connection: boolean;
    /** 接続状態の補足情報 */
    connectionInfo: string;
  };
};
