import OBSWebSocket from 'obs-websocket-js';

export function init() {
  const obs = new OBSWebSocket();
  window.obsWs = obs;

  return obs;
}

export function startConnect(endpoint: string, password?: string) {
  console.log(`startConnect ${endpoint}`);
  window.obsWs.connect({ address: endpoint, password: password });
}

export function closeConnect() {
  console.log(`closeConnect`);
  if (window.obsWs) window.obsWs.disconnect();
}
