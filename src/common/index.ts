declare const AirConsole: any;
export const Module = "common";

export class Server {
  airConsole = new AirConsole();
  playerData: PlayerData[] = [];
  sendPlayerData() {
    this.sendAllClients(this.playerData);
  }

  private sendAllClients(data: any) {
    this.airConsole.broadcast(data);
  }
}

export class Client {
  id: number = 0;
  airconsole: AirConsole;
  playerData: PlayerData[] = [];
  constructor() {
    if (!this.id) this.id = this.airconsole.getDeviceId() as number;
    this.airconsole = new AirConsole();
    this.subscribeToAirConsole();
    this.getPlayers();
  }

  getPlayers() {
    setInterval(() => {
      (this.playerData = this.airconsole.getPlayerData()), 300;
    });
  }

  sendControllerData(controllerData: ControllerData) {
    controllerData.id = this.id;
    this.airconsole.message(AirConsole.SCREEN, JSON.stringify(controllerData));
  }

  recive() {
    this.playerData;
  }

  subscribeToAirConsole() {
    this.onMessage();
  }

  onMessage() {
    this.airconsole.onMessage = (from: any, data: any) => {
      data.filter();
    };
  }
}

export class PlayerData {
  constructor(
    public x: number,
    public y: number,
    deviceId: number,
    isReady: boolean
  ) {
    this.id = deviceId;
    this.isReady = isReady;
  }
  type: TransactionType = TransactionType.PlayerData;
  playerState: PlayerState = PlayerState.idle;
  isAngryDad: boolean = false;
  isReady: boolean = false;
  id: number = 0;
}

export enum TransactionType {
  ServerState,
  PlayerData,
  ControllerData
}

export enum ServerState {
  joining,
  running,
  final
}

export class ControllerData {
  constructor(public x: number = 0, public y: number = 0) {}
  id: number = 0;
}

export enum PlayerState {
  idle,
  dead,
  running,
  interacting
}
