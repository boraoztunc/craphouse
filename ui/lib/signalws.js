import base64 from 'compact-base64';
import {clear, emit, is, on} from 'use-minimal-state';
import {until} from '../lib/state-utils';

export default function signalws({
  url,
  roomId,
  myPeerId,
  myConnId,
  sign,
  subscriptions = [],
}) {
  if (!url) throw new Error('signaling url required');
  if (!roomId) throw new Error('room id required');
  if (!myPeerId) throw new Error('peer id required');
  if (!myConnId) myConnId = String(Math.random()).slice(2, 10);

  url = url.indexOf('://') === -1 ? 'wss://' + url : url;
  url = url.replace('http', 'ws');
  if (!url.endsWith('/')) url += '/';
  let token = base64.encodeUrl(JSON.stringify(sign({})));
  let subs = subscriptions.join(',');
  url += `${roomId}?id=${myPeerId};${myConnId}&token=${token}&subs=${subs}`;

  let ws = new WebSocket(url);

  ws.addEventListener('open', () => {
    is(hub, 'opened', true);
  });
  ws.addEventListener('message', ({data}) => {
    let msg = decode(data);
    if (msg === undefined) return;
    let {t: topic, d, p} = msg;
    if (window.DEBUG && d?.peerId !== myPeerId) {
      console.log('ws message', data);
    }
    if (topic === 'opened' || topic === 'closed') return;
    let payload = d ?? {};
    if (p) {
      let [peerId, connId] = p.split(';');
      payload.peerId = peerId;
      payload.connId = connId;
    }
    emit(hub, topic, payload);
  });
  ws.addEventListener('error', () => {
    if (window.DEBUG) {
      console.error('ws error');
    }
  });
  ws.addEventListener('close', () => {
    if (window.DEBUG) console.log('ws closed');
    is(hub, 'closed', true);
    clear(hub);
  });

  const hub = {
    opened: false,
    closed: false,
    myPeerId,
    ws,
    subs: subscriptions,
    subscribe(topic, onMessage) {
      return subscribe(hub, topic, onMessage);
    },
    broadcast(topic, message = {}) {
      return broadcast(hub, topic, message);
    },
    close() {
      close(hub);
    },
  };
  return hub;
}

function subscribe(hub, topic, onMessage) {
  let {subs} = hub;
  if (!subs.includes(topic)) {
    subs.push(topic);
    until(hub, 'opened').then(() => send(hub, {s: topic}));
  }
  return on(hub, topic, data => onMessage(data));
  // TODO: send unsubscribe msg on unsubscribing
}

async function broadcast(hub, topic, message) {
  await until(hub, 'opened');
  return send(hub, {t: topic, d: message});
}

function close({ws, closed}, code = 1000) {
  if (!closed) ws.close(code);
}

function send(hub, msg) {
  let {ws} = hub;
  msg = JSON.stringify(msg);
  if (window.DEBUG) console.log('ws sending', msg);
  try {
    ws.send(msg);
    return true;
  } catch (err) {
    if (window.DEBUG) {
      console.error('ws error');
      console.error(err);
    }
    close(hub);
    return false;
  }
}

function decode(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return undefined;
  }
}
