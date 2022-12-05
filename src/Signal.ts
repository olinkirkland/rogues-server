import { EventEmitter } from 'events';

export default class Signal extends EventEmitter {
  private static _instance: Signal;

  private constructor() {
    super();
  }

  static get instance(): Signal {
    if (!Signal._instance) Signal._instance = new Signal();
    return Signal._instance;
  }
}
