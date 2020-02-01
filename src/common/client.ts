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
  PlayerUpdateData
} from "./index";

export class Client {
  serverState: ServerState = ServerState.initial;
  id: number = 0;
  airconsole: any;
  playerData: PlayerData[] = [];
  objectData: ObjectData[] = [];
  serverData: ServerData = new ServerData();
  constructor() {
    if (!this.id) this.id = this.airconsole.getDeviceId() as number;
    this.airconsole = new AirConsole();
    this.subscribeToAirConsole();
  }

  currentPlayerData() {
    return this.playerData.filter(pD => pD.id === this.id)[0];
  }

  sendControllerData(controllerData: ControllerData) {
    controllerData.id = this.id;
    this.notifyServer(controllerData);
  }

  recive() {
    this.playerData;
  }

  subscribeToAirConsole() {
    this.airconsole.onMessage = (from: any, data: TransactionTypeInterface) => {
      switch (data.transactionType) {
        case TransactionType.PlayerData:
          this.playerData = (data as PlayerUpdateData).playerData;
          break;
        case TransactionType.ObjectData:
          this.objectData = (data as ObjectUpdateData).objectData;
          break;
        case TransactionType.ServerData:
          this.serverData = (data as ServerUpdateData).serverData;
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

  private notifyServer(data: any) {
    this.airconsole.message(AirConsole.SCREEN, JSON.stringify(data));
  }

  getTime(): number {
    return this.serverData.timerValueInSeconds;
  }
}
