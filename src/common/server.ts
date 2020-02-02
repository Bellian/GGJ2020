declare class AirConsole {
  broadcast(data: any): void;
  message(device_id: number, data: any): void;
  onMessage(device_id: number, data: any): void;
  onConnect: (device_id: number) => void;
  onDisconnect: (device_id: number) => void;
  onDeviceStateChange: (device_id: number, user_data: any) => void;
  onCustomDeviceStateChange: (device_id: number, user_data: any) => void;
  setActivePlayers(max_players: number): void;
}

import {
  TransactionTypeInterface,
  ControllerData,
  TransactionType,
  ServerState,
  PlayerData,
  ObjectData,
  ServerData,
  PlayerUpdateData,
  PlayerState
} from "./index";
import { ConnectedDevice, getDevice, getAllDevices } from "./connectedDevice";
import { EventListener } from "./eventListener";
import { GameState } from "./server/gameState";
import { GameStateJoin } from "./server/gameStateJoin";


const eventListener = EventListener.get();

export const OBJECTDATAMAXHEALTH: number = 10;
export class Server {
  airConsole: AirConsole;
  serverData: ServerData;
  playerData: PlayerData[] = [];
  objectData: ObjectData[] = [];
  sendPlayerToClient: any;

  gameState: GameState;


  constructor() {
    this.airConsole = new AirConsole();
    this.serverData = new ServerData(30, ServerState.initial);
    this.subscribeToAirConsole();

    this.gameState = new GameStateJoin(this, 3000);
    eventListener.on('newGameState', (state) => {
      this.gameState = state;
    })

    this.initTick();
    this.initMessageHandler();

  }

  initTick () {
    let time = performance.now();
    setInterval(() => {
      const newTime = performance.now();
      const delta = newTime - time;
      time = newTime;

      this.gameState.tick(delta);
    }, 1000 / 60);
  }

  private initMessageHandler() {
    this.airConsole.onMessage = (from: number, data: any) => {
      if (data) {
        if(from === 0){
          const event = 'CLIENT_'+data.action;
          data.data.from = from;
          eventListener.trigger(event as any, data.data);
        } else {
          // IDK
        }
      }
    };
  }

  subscribeToAirConsole() {
    this.airConsole.onConnect = (id) => {
    };

    this.airConsole.onDisconnect = (id) => {
      getDevice(id).disconnect();
    };

    this.airConsole.onDeviceStateChange = (id, data) => {
      try {
        getDevice(id).updateState(data)
      } catch(e) {
        const newDevice = new ConnectedDevice(id);
        newDevice.updateState(data);
      }
    };

    this.airConsole.onCustomDeviceStateChange = (id, data) => {
      try {
        getDevice(id).updateCustomState(data)
      } catch(e) {
        const newDevice = new ConnectedDevice(id);
        newDevice.updateCustomState(data);
      }
    };
  }













  sendPlayerData() {
    // console.table(this.playerData);
    this.sendAllClients({
      transactionType: TransactionType.PlayerData,
      playerData: this.playerData
    });
  }

  sendObjectData() {
    this.sendAllClients({
      transactionType: TransactionType.ObjectData,
      objectData: this.objectData
    });
  }

  sendServerData() {
    this.sendAllClients({
      transactionType: TransactionType.ServerData,
      serverData: this.serverData
    });
  }
}
