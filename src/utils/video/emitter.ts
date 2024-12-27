type EventHandler = (...args: any[]) => void;

class Emitter {
  private events: Record<string, EventHandler[]>;

  constructor() {
    this.events = {};
  }

  emit(event: string, ...args: any[]): this {
    if (this.events[event]) {
      this.events[event].forEach(fn => fn(...args));
    }
    return this;
  }

  on(event: string, fn: EventHandler): this {
    if (this.events[event]) {
      this.events[event].push(fn);
    } else {
      this.events[event] = [fn];
    }
    return this;
  }

  off(event: string, fn?: EventHandler): this {
    if (fn && typeof fn === "function") {
      const listeners = this.events[event];
      if (listeners) {
        const index = listeners.findIndex(_fn => _fn === fn);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.events[event] = [];
    }
    return this;
  }
}

export default Emitter;
