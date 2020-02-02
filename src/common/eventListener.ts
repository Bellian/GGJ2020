import { ConnectedDeviceData, ConnectedDevice } from "./connectedDevice";
import { GameState } from "./server/gameState";

interface EventCallbacks {
  deviceJoined: ConnectedDevice;
  deviceDisconnected: ConnectedDevice;

  newGameState: GameState;

  airConsoleMessage: [number, any];

  SERVER_updateState: {
    state: string;
  };
}

export class EventListener {
  static instance: EventListener;
  static get() {
    if (this.instance === undefined) {
      this.instance = new EventListener();
    }
    return this.instance;
  }

  listener: { [event: string]: Function[] } = {};

  on<T extends keyof EventCallbacks>(
    event: T,
    callback: (arg: EventCallbacks[T]) => void
  ) {
    if (this.listener[event] === undefined) {
      this.listener[event] = [];
    }
    this.listener[event].push(callback);
    return callback;
  }

  off<T extends keyof EventCallbacks>(
    event: T,
    callback: (arg: EventCallbacks[T]) => void
  ) {
    if (this.listener[event] !== undefined) {
      const index = this.listener[event].indexOf(callback);
      if (index !== -1) {
        this.listener[event].splice(index, 1);
      }
    }
    return callback;
  }

  trigger<T extends keyof EventCallbacks>(event: T, data: EventCallbacks[T]) {
    if (this.listener[event] !== undefined) {
      this.listener[event].forEach(e => e(data));
    }
  }
}
