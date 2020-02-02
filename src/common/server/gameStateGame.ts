import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { GameStateChoose } from "./gameStateChoose";
import { ConnectedDevice, getAllDevices } from "../connectedDevice";
import { LevelMap } from "../../screen/map/levelMap";
import { vec2 } from "gl-matrix";
import { PhysicsEngine } from "../../screen/physicsEngine";
import Spawnpoint from "../../screen/map/spawnpoint";
import Player from "../../screen/map/player";
import Pawn from "../../screen/map/pawn";

const eventListener = EventListener.get();
const gameTime = 120000;

export class GameStateGame extends GameState {
  nextState = GameStateChoose as any;
  timerStarted!: number;
  updateInterval: any;

  constructor(server: Server, data: ConnectedDevice) {
    super(server, data);
  }

  tick(delta: number) {
    if (this.timerStarted === undefined) {
      return;
    }
    const timeLeft = gameTime - (Date.now() - this.timerStarted);
    if (timeLeft <= 0) {
      console.log("game is over, angry man won");
      this.exit();
    }
  }

  players: Map<ConnectedDevice, Player> = new Map();
  enter() {
    this.startTimer();
    this.server.airConsole.broadcast({
      action: "updateState",
      data: {
        state: "game",
        timerStarted: this.timerStarted,
        duration: gameTime
      }
    });

    console.log("is angry:", this.data);

    eventListener.on("CLIENT_updateControllerData", (data: any) => {
      console.log(data.from, data.doesAction, data.moveDirection);
    });

    getAllDevices()
      .filter(e => e.deviceId !== 0)
      .forEach(e => {
        if (!this.players.has(e)) {
          console.log("create player for:", e.deviceId);
          let player = new Player(level, vec2.fromValues(-5000, -5000), Pawn);
          player.pawn.viewUpdate();
          this.players.set(e, player);
        }
      });

    this.updateInterval = setInterval(() => {
      const result: { [id: number]: any } = {};
      getAllDevices()
        .filter(e => e.deviceId !== 0)
        .forEach(e => {
          let player = this.players.get(e);
          result[e.deviceId] = {
            position: player!.pawn!.position,
            direction: player!.pawn!.direction
          };
        });
      this.server.airConsole.broadcast({
        action: "updatePlayer",
        data: result
      });
    }, 1000 / 24);

    PhysicsEngine.init();
    const level = new LevelMap("../level/level1.json", document.body);

    level.wait.then(() => {
      // Engine.showDebugPlayer();
      PhysicsEngine.showDebugRenderer(level);
      PhysicsEngine.start();

      const spawnpoints = level.getAllLevelObjectsByType(Spawnpoint);
      const devices = getAllDevices();
      for (let player of this.players) {
        // devices.spawnpoints[i].position;
      }
    });
  }

  exit() {
    eventListener.off("CLIENT_updateControllerData");
    clearInterval(this.updateInterval);
    super.exit();
  }

  startTimer() {
    console.log("game started");
    this.timerStarted = Date.now();
  }
}
