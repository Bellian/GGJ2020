declare const AirConsole: any;
export const Module = "common";

export class Server {
  airConsole = new AirConsole();
}

export class Client {
  airconsole: AirConsole;
  playerData: PlayerData;
  constructor(data: { id: number }) {
    this.airconsole = new AirConsole();
    this.playerData = new PlayerData();
    this.subscribeToAirConsole();
  }

  send() {
    data.id = this.airconsole.getDeviceId() as number;
    this.airconsole.message(AirConsole.SCREEN, JSON.stringify(data));
  }

  recive() {}

  subscribeToAirConsole() {
    //  this.onMessage();
  }

  // onMessage(){
  // this.airconsole.onMessage =>(from, data) {
  //   var info = document.createElement('DIV');
  //   info.innerHTML = data;
  //   document.body.appendChild(info);
  // };}
}

export class PlayerData {
  type: TransactionType = TransactionType.PlayerData;
  x: number = 0;
  y: number = 0;
  playerState: PlayerState = PlayerState.idle;
  isAngryDad: boolean = false;
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
  x: number = 0;
  y: number = 0;
}

export enum PlayerState {
  idle,
  dead,
  running,
  interacting
}
