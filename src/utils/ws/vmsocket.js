import EventEmitter from './events'

/**
 * MessageEvent {
 *    scenarios String  // custom event name
 *    detail Object     // event content
 * }
 */
export default class VmSocket extends EventEmitter {
  // internal websocket instance
  ws = null
  // options
  opt = {}
  constructor(uri, opt) {
    super()
    this.opt = this.opt || {}
    this.opt.uri = this.opt.uri || uri
    this.init()
  }

  init() {
    this.ws = new WebSocket(this.opt.uri)
    this.listening()
  }

  listening() {
    this.ws.addEventListener('message', event => {
      console.log('event is ', event)
      this.notify(event)
    })
  }

  // notify event message
  notify(event) {
    try {
      const { scenarios, detail, url_key, code } = JSON.parse(event.data)
      if (scenarios) {
        this.emit(scenarios, detail)
      }
      if (url_key && !isNaN(code)) {
        const pathArray = url_key.split('/')
        if (pathArray.length) {
          this.emit(pathArray[pathArray.length - 1], code)
        }
      }
    } catch (err) {
      // do nothing
    }
  }
}
