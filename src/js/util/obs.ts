import OBSWebSocket from 'obs-websocket-js';
import { sleep } from './common';

export function init(endpoint: string, password?: string) {
  console.log(`obs init ${endpoint}`);

  const obs = new OBSWebSocket();
  window.obsWs = obs;

  obs.on('ConnectionOpened', () => {
    obs.send('SetHeartbeat', { enable: true });
  });

  obs.connect({ address: endpoint, password: password });

  return obs;
}
