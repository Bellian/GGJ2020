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
  PlayerState
} from "./index";

export class Client {
  id: number = 0;
  airConsole: any;
  playerData: PlayerData[] = [];
  objectData: ObjectData[] = [];
  serverData: ServerData;
  constructor() {
    this.serverData = new ServerData();
    this.airConsole.onReady(this.onAirConReady);
  }

  onAirConReady(){
    this.airConsole = new AirConsole();
    if (!this.id) this.id = this.airConsole.getDeviceId() as number;
    this.subscribeToAirConsole();
  }

  updateServerCallbacks: Set<(serverData: ServerData) => void> = new Set();
  onUpdateServerData(cb: (serverData: ServerData) => void) {
    this.updateServerCallbacks.add(cb);
  }

  updateServerData() {
    this.updateServerCallbacks.forEach(e => e(this.serverData));
  }

  currentPlayerData() {
    return this.playerData.filter(pD => pD.id === this.id)[0];
  }

  sendControllerData(controllerData: ControllerData) {
    controllerData.id = this.id;
    this.notifyServer(controllerData);
  }

  subscribeToAirConsole() {
    this.airConsole.onMessage = (from: any, data: TransactionTypeInterface) => {
      switch (data.transactionType) {
        case TransactionType.PlayerData:
          this.playerData = (data as PlayerUpdateData).playerData;
          break;
        case TransactionType.ObjectData:
          this.objectData = (data as ObjectUpdateData).objectData;
          break;
        case TransactionType.ServerData:
          this.serverData = (data as ServerUpdateData).serverData;
          this.updateServerData();
          break;
        default:
          console.error("not implemented", data);
          break;
      }
    };
  }

  toggleAngryDad(): boolean {
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
    this.airConsole.message(AirConsole.SCREEN, JSON.stringify(data));
  }

  getTime(): number {
    return this.serverData.timerValueInSeconds;
  }
}
