declare const AirConsole: any;

export * from "./client";
export * from "./server";

export class PlayerData implements TransactionTypeInterface {
  constructor(public x: number, public y: number, deviceId: number) {
    this.id = deviceId;
  }
  transactionType: TransactionType = TransactionType.PlayerData;
  playerState: PlayerState = PlayerState.idle;
  characterAppearanceType: CharacterAppearanceType =
    CharacterAppearanceType.wichtel1;
  isAngryDad: boolean | undefined = undefined;
  id: number = 0;
}

export enum TransactionType {
  ServerData,
  PlayerData,
  ControllerData,
  ObjectData
}

export enum ServerState {
  initial, //initial state nothing selected
  lobby, //wichtelskin selection & timer started
  characterSelection, //wichtel or angryDad
  running, //gamerunning
  final
}

export class ControllerData implements TransactionTypeInterface {
  constructor(public x: number = 0, public y: number = 0) {}
  transactionType: TransactionType = TransactionType.ControllerData;
  id: number = 0;
}

export class ServerData {
  serverState: ServerState;
  constructor(
    public timerValueInSeconds: number = 30,
    serverState: ServerState 
  ) {
    this.serverState = serverState;
  }
}

export enum PlayerState {
  idle,
  dead,
  running,
  interacting
}

export enum CharacterAppearanceType {
  wichtel1,
  wichtel2,
  wichtel3,
  wichtel4
}

export interface TransactionTypeInterface {
  transactionType: TransactionType;
}
export class ObjectData {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public damage: number = 0,
    public objectId: number
  ) {}
}
export interface PlayerUpdateData {
  transactionType: TransactionType;
  playerData: PlayerData[];
}
export interface ObjectUpdateData {
  transactionType: TransactionType;
  objectData: ObjectData[];
}
export interface ServerUpdateData {
  transactionType: TransactionType;
  serverData: ServerData;
}
