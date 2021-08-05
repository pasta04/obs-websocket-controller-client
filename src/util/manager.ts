import EventEmitter from 'events';

class Manager extends EventEmitter {
  constructor() {
    super();
  }

  ws: WebSocket | null = null;
  endpoint: string = '';
  isReconnect = false;
  reconnectInterval = 1000;

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

        const ws = new WebSocket('ws://' + this.endpoint);
        ws.onmessage = (event: MessageEvent<any>) => {
          const data = event.data;
          console.log(data);
          // dataのチェック
          if (!this.isValidData(data)) return;

          this.emit('data', data);
        };

        ws.onclose = (event) => {
          console.log(`close - ${event.reason}`);
          this.emit('close');

          if (!this.isReconnect) return;
          setTimeout(() => {
            this.start();
          }, this.reconnectInterval);
        };

        window.managerWs = ws;
        this.ws = ws;
        this.emit('open');
      }
    } catch (e) {
      this.emit('error', e);
    }
  }

  public stop() {
    if (!this.ws) return;
    if (!this.ws.OPEN) return;

    this.isReconnect = false;
    this.ws.close();
    this.emit('close');
  }

  private isValidData(data: any) {
    if (!Array.isArray(data)) false;
    const invaliddata = data.filter((item: any) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) return true;
      if (item.target !== 'pc' && item.target !== 'obsws') return true;

      return false;
    });
    if (invaliddata.length > 0) return false;

    return true;
  }

  // イベント
  public on(event: 'data', listener: (data: any) => void): this;
  public on(event: 'open', listener: () => void): this;
  public on(event: 'close', listener: (reason: string) => void): this;
  public on(event: 'error', listener: (err: Error) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export default new Manager();
