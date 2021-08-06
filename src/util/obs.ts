import OBSWebSocket from 'obs-websocket-js';
import EventEmitter from 'events';

class Obs extends EventEmitter {
  constructor() {
    super();

    this.ws.on('ConnectionOpened', (data) => {
      this.conncected = true;
      this.emit('open');
    });
    this.ws.on('ConnectionClosed', (data) => {
      this.conncected = false;
      this.emit('close', '');
      if (this.isReconnect) {
        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval);
      }
    });

    window.obsWs = this.ws;
  }

  ws: OBSWebSocket = new OBSWebSocket();
  endpoint: string = '';
  password: string | undefined = undefined;
  isReconnect = false;
  reconnectInterval = 2000;

  conncected: boolean = false;

  public init(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async start() {
    // 多重実行を防止
    if (this.isReconnect) return;

    this.isReconnect = true;
    this.connect();
  }

  private async connect() {
    try {
      if (!this.endpoint) {
        setTimeout(async () => {
          return await this.connect();
        }, 1000);
      } else {
        if (this.conncected) this.ws.disconnect();
        this.ws.connect({ address: this.endpoint, password: this.password }).catch((error) => {
          this.emit('error', error);
          // console.log(error);
        });
      }
    } catch (e) {
      //
    }
  }

  public stop() {
    if (!this.ws) return;

    this.isReconnect = false;
    if (this.conncected) this.ws.disconnect();
    this.emit('close');
  }

  // イベント

  public on(event: 'open', listener: () => void): this;
  public on(event: 'close', listener: (reason: string) => void): this;
  public on(event: 'error', listener: (error: object) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export default new Obs();
