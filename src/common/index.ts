export const Module = "common";

export class Server {
  airConsole = new AirConsole();
}

export class PlayerData {
  type: TransactionType = TransactionType.PlayerData;
  x: number;
  y: number;
  id: number;
  playerState: PlayerState;
  isAngryDad: boolean;
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
  type: TransactionType = TransactionType.ControllerData;
  x: number;
  y: number;
  id: number;
}

export class PositionData {
  x: number;
  y: number;
  id: number;
}

export enum PlayerState {
  dead,
  running,
  interacting
}
