export default class EventEmitter {
  events = null
  constructor() {
    this.events = new Map()
  }
  on(key, handler) {
    const handlers = this.events.get(key)
    if (handlers) handlers.push(handler)
    else this.events.set(key, [handler])
    return () => {
      this.off(key, handler)
    }
  }
  off(key, handler) {
    const handlers = this.events.get(key)
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1)
      } else {
        this.events.set(key, [])
      }
    }
    return this
  }
  emit(key, event) {
    const handlers = this.events.get(key)
    if (handlers) {
      handlers.map(handler => handler(event))
    }
    return this
  }
}
