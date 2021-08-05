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
    });

    window.obsWs = this.ws;
  }

  ws: OBSWebSocket = new OBSWebSocket();
  endpoint: string = '';
  password: string | undefined = undefined;
  isReconnect = false;
  reconnectInterval = 1000;

  conncected: boolean = false;

  public init(endpoint: string) {
    this.endpoint = endpoint;
  }

  public start() {
    try {
      if (!this.endpoint) {
        setTimeout(() => {
          return this.start();
        }, 1000);
      } else {
        this.isReconnect = true;
        console.log(`start ${this.conncected}`);

        if (this.conncected) this.ws.disconnect();
        this.ws.connect({ address: this.endpoint, password: this.password });
      }
    } catch (e) {
      this.emit('error', e);
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
  public on(event: 'error', listener: (err: Error) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export default new Obs();
