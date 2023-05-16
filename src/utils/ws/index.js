import VmSocket from './vmsocket.js'
import { getToken } from '@/utils/auth'

const WEBSOCKET_PATH = '/ws/test/'

// events
export const AloneTargetEvent = 'alonetarget'

function getWebSocketUrl() {
  const l = window.location
  return (l.protocol === 'https' ? 'wss://' : 'ws://') + l.hostname + ':' + l.port + WEBSOCKET_PATH
}

export const vmSocket = new VmSocket(
  getWebSocketUrl() + '?authorization=' + getToken()
)
