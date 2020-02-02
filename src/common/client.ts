declare const AirConsole: any;
import {
  TransactionTypeInterface,
  ControllerData,
  TransactionType,
  ServerState,
  PlayerData,
  CharacterAppearanceType,
  ServerData,
  ObjectData,
  ServerUpdateData,
  ObjectUpdateData,
  PlayerUpdateData,
  PlayerState,
  AirConsoleMessage
} from "./index";
import { EventListener } from "./eventListener";
import { ConnectedDevice, getDevice } from "./connectedDevice";

const eventListener = EventListener.get();

export class Client {
  id: number = 0;
  airConsole: any;
  playerData: PlayerData[] = [];
  objectData: ObjectData[] = [];
  serverData: ServerData;

  awaitReady: Promise<number>;

  constructor() {
    this.serverData = new ServerData(30, ServerState.initial);

    this.awaitReady = new Promise((resolve) => {
      this.airConsole = new AirConsole();
      this.initMessageHandler();

      this.airConsole.onDeviceStateChange = (id: number, state: any) => {
        try {
          getDevice(id).updateState(state)
        } catch(e) {
          const newDevice = new ConnectedDevice(id);
          newDevice.updateState(state);
        }
      };



      eventListener.on('SERVER_updateState', (state: any) => {
        console.log('game state changed', state.state);

        if(state.state === 'join') {
          // prepare stuff for join state
        }

        if(state.state === 'choose') {
          // prepare stuff for choose state
          this.airConsole.setCustomDeviceState({
            wantAngry: Math.random() > 0.5,
          })
        }

        if(state.state === 'game') {
          // prepare stuff for game state
        }

      });


    });
  }

  private initMessageHandler() {
    this.airConsole.onMessage = (from: number, data: AirConsoleMessage<any>) => {
      if (data) {
        if(from === 0){
          const event = 'SERVER_'+data.action;
          eventListener.trigger(event as any, data.data);
        } else {
          // IDK
        }
      }
    };

    
  }






  updateServerCallbacks: Set<(serverData: ServerData) => void> = new Set();
  onUpdateServerData(cb: (serverData: ServerData) => void) {
    this.updateServerCallbacks.add(cb);
  }

  updateServerData() {
    this.updateServerCallbacks.forEach(e => e(this.serverData));
  }

  currentPlayerData() {
    console.table("currentPlayerData playerData", this.playerData);
    console.table("currentPlayerData id", this.id);
    return this.playerData.filter(pD => pD.id === this.id)[0];
  }

  sendControllerData(controllerData: ControllerData) {
    controllerData.id = this.id;
    this.notifyServer(controllerData);
  }

  subscribeToAirConsole() {
    this.airConsole.onMessage = (from: any, data: TransactionTypeInterface) => {
      if (data) {
        switch (data.transactionType) {
          case TransactionType.PlayerData:
            console.log("received player data", data);
            this.playerData = (data as PlayerUpdateData).playerData;
            break;
          case TransactionType.ObjectData:
            // console.log("received object data", data);
            this.objectData = (data as ObjectUpdateData).objectData;
            break;
          case TransactionType.ServerData:
            // console.log("received server data", data);
            this.serverData = (data as ServerUpdateData).serverData;
            this.updateServerData();
            break;
          default:
            console.error("client onMessage switch", data);
            break;
        }
      } else {
        console.error("client onMessage", data);
      }
    };
  }

  toggleAngryDad(): boolean {
    console.table("toggleAngryDad playerData", this.playerData);
    console.table("toggleAngryDad id", this.id);
    let currentPlayer = this.currentPlayerData();
    if (currentPlayer.isAngryDad === undefined) {
      currentPlayer.isAngryDad = false;
    } else {
      currentPlayer.isAngryDad = !currentPlayer.isAngryDad;
    }
    this.notifyServer(currentPlayer);
    return currentPlayer.isAngryDad;
  }

  changeAppearance(
    appearance: CharacterAppearanceType
  ): CharacterAppearanceType {
    let currentPlayer = this.currentPlayerData();
    currentPlayer.characterAppearanceType = appearance;
    this.notifyServer(currentPlayer);
    return currentPlayer.characterAppearanceType;
  }

  interacting(playerState: PlayerState): PlayerState {
    let currentPlayer = this.currentPlayerData();
    currentPlayer.playerState = playerState;
    this.notifyServer(currentPlayer);
    return currentPlayer.playerState;
  }

  private notifyServer(data: any) {
    this.airConsole.message(AirConsole.SCREEN, data);
  }

  getTime(): number {
    return this.serverData.timerValueInSeconds;
  }
}
