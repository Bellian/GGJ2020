declare const AirConsole: any;
import {
  TransactionTypeInterface,
  ControllerData,
  TransactionType,
  ServerState,
  PlayerData,
  ObjectData,
  ServerData,
  PlayerUpdateData
} from "./index";

export class Server {
  airConsole: any;
  serverData: ServerData;
  playerData: PlayerData[] = [];
  objectData: ObjectData[] = [];
  constructor() {
    this.airConsole = new AirConsole();
    this.serverData = new ServerData();
    this.subscribeToAirConsole();
  }
  updateServerCallbacks: Set<(serverState: ServerState) => void> = new Set();
  onUpdateServerState(cb: () => void) {
    this.updateControllerCallbacks.add(cb);
  }

  private updateServerState() {
    this.updateServerCallbacks.forEach(e => e(this.serverData.serverState));
  }

  updateControllerCallbacks: Set<
    (controllerData: ControllerData) => void
  > = new Set();
  onUpdateControllerData(cb: (controllerData: ControllerData) => void) {
    this.updateControllerCallbacks.add(cb);
  }

  private updateControllerData(controllerData: ControllerData) {
    this.updateControllerCallbacks.forEach(e => e(controllerData));
  }

  private createAndUpdatePlayer(data: PlayerData) {
    let playerFound = this.playerData.find(pD => pD.id === data.id);
    if (!playerFound) {
      playerFound = new PlayerData(0, 0, data.id);
      this.playerData.push(playerFound);
      this.startAfterFirstPlayerJoined();
    }
    this.updatePlayer(data);
  }

  private startAfterFirstPlayerJoined() {
    if (this.playerData.length == 1) {
      this.serverData.serverState = ServerState.lobby;
      this.updateServerState();
      this.serverStateUpdate(30, ServerState.characterSelection, () => {
        this.serverStateUpdate(15, ServerState.running, () => {
          this.serverStateUpdate(300, ServerState.final, () => {});
        });
      });
    }
  }

  private serverStateUpdate(
    timerValueInSeconds: number,
    serverState: ServerState,
    cb: () => void
  ) {
    let timer = this.setAndStartTimer(timerValueInSeconds);
    setTimeout(() => {
      this.serverData.serverState = serverState;
      this.updateServerState();
      cb();
      clearInterval(timer);
    }, timerValueInSeconds);
  }

  private setAndStartTimer(timerValueInSeconds: number) {
    this.serverData.timerValueInSeconds = timerValueInSeconds;
    return setInterval(() => {
      if (this.serverData.timerValueInSeconds)
        this.serverData.timerValueInSeconds--;
      this.sendServerData();
    }, 1000);
  }

  public updatePlayer(updateData: PlayerData) {
    let player = this.playerData.filter(pD => pD.id === updateData.id)[0];
    player = player;
    this.sendPlayerData();
  }

  private sendAllClients(data: any) {
    this.airConsole.broadcast(data);
  }

  private onMessage() {
    this.airConsole.onMessage = (from: any, data: TransactionTypeInterface) => {
      switch (data.transactionType) {
        case TransactionType.PlayerData:
          this.createAndUpdatePlayer(data as PlayerData);
          break;
        case TransactionType.ControllerData:
          this.updateControllerData(data as ControllerData);
          //JS after change   this.updatePlayer()
          break;
        default:
          console.error("not implemented", data);
          break;
      }
      this.sendPlayerData();
    };
  }

  subscribeToAirConsole() {
    this.onMessage();
    this.airConsole.onConnect = (id: number) => {
      this.createAndUpdatePlayer({ id: id } as PlayerData);
      this.sendObjectData();
      this.sendServerData();
    };
  }

  sendPlayerData() {
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
