export function init(endpoint: string) {
  const ws = new WebSocket('ws://' + endpoint);
  window.managerWs = ws;
  return ws;
}
