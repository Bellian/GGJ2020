declare const AirConsole: any;
import {
  TransactionTypeInterface,
  ControllerData,
  TransactionType,
  ServerState,
  PlayerData,
  ObjectData,
  ServerData
} from "./index";

export class Server {
  serverState: ServerState = ServerState.initial;
  timerValueInSeconds: number = 0;
  airConsole = new AirConsole();
  playerData: PlayerData[] = [];
  objectData: ObjectData[] = [];

  updateServerState = () => (cb: (serverState: ServerState) => void) => {
    cb(this.serverState);
  };

  createAndUpdatePlayer(data: PlayerData) {
    let playerFound = this.playerData.find(pD => pD.id === data.id);
    if (!playerFound) {
      playerFound = new PlayerData(0, 0, data.id, false);
      this.playerData.push(playerFound);
      this.startAfterFirstPlayerJoined();
    }
    this.updatePlayer(data);
  }

  startAfterFirstPlayerJoined() {
    if (this.playerData.length == 1) {
      this.setAndStartTimer(30);
      this.serverState = ServerState.lobby;
      this.updateServerState();
      setTimeout(() => {
        this.serverState = ServerState.characterSelection;
        this.updateServerState();
      }, this.timerValueInSeconds);
    }
  }

  private setAndStartTimer(timerValueInSeconds: number) {
    this.timerValueInSeconds = timerValueInSeconds;
    setInterval(() => {
      if (this.timerValueInSeconds) this.timerValueInSeconds--;
    }, 1000);
  }

  updatePlayer(updateData: PlayerData) {
    let player = this.playerData.filter(pD => pD.id === updateData.id)[0];
    player.isAngryDad = player.isAngryDad;
    player.x = player.x;
    player.y = player.y;
    player.playerState = player.playerState;
    player.characterAppearanceType = player.characterAppearanceType;
    this.sendPlayerData();
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
      serverData: new ServerData(this.timerValueInSeconds)
    });
  }

  private sendAllClients(data: any) {
    this.airConsole.broadcast(data);
  }

  onMessage() {
    this.airconsole.onMessage = (from: any, data: TransactionTypeInterface) => {
      switch (data.transactionType) {
        case TransactionType.PlayerData:
          this.createAndUpdatePlayer(data);
          break;
        case TransactionType.ControllerData:
          let controllerData = data as ControllerData;
          // let currentPlayerData = this.getOrCreatePlayer(data);
          // ///TODO: calculate player position
          this.updatePlayer(data);
          break;
        default:
          console.error("not implemented", data);
          break;
      }
      this.sendPlayerData();
    };
  }
}
