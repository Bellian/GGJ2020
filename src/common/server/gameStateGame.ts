import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { GameStateChoose } from "./gameStateChoose";
import { ConnectedDevice, getAllDevices, getDevice } from "../connectedDevice";
import { LevelMap } from "../../screen/map/levelMap";
import { vec2 } from "gl-matrix";
import { PhysicsEngine } from "../../screen/physicsEngine";
import Spawnpoint from "../../screen/map/spawnpoint";
import Player from "../../screen/map/player";
import Pawn from "../../screen/map/pawn";
import LevelObject from "../../screen/map/levelObject";
import { Body } from "matter-js";

const eventListener = EventListener.get();
const gameTime = 1200000;
const forceDefault = 0.001;

let tmp = vec2.create();

export class GameStateGame extends GameState {
    nextState = GameStateChoose as any;
    timerStarted!: number;
    updateInterval: any;
    players!: Map<ConnectedDevice, Player>;
    deviceInputs!: Map<ConnectedDevice, {
        from: number;
        doesAction: boolean;
        moveDirection: vec2;
        isTouching: boolean;
    }>;
    level!: LevelMap;

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

        getAllDevices()
            .filter(device => device.deviceId !== 0)
            .forEach(device => {
                const player = this.players.get(device);
                if (player === undefined) { return; }
                const data = this.deviceInputs.get(device);
                if (data === undefined) { return; }
                if(!data.isTouching){
                    return;
                }

                vec2.copy(tmp, data.moveDirection);
                vec2.normalize(tmp, tmp);

                Body.applyForce(player.pawn.hitBox!, player.pawn.hitBox!.position, {
                    x: tmp[0] * forceDefault,
                    y: -tmp[1] * forceDefault,
                });

                player.position = vec2.fromValues(player.pawn.hitBox!.position.x, player.pawn.hitBox!.position.y);

                vec2.copy(player.pawn.position, player.position);
                player.pawn.viewUpdate();

                if(device === this.data){
                    this.level.setCameraPosition(player.pawn.position);
                }
            })
    }

    enter() {
        this.server.airConsole.broadcast({
            action: "updateState",
            data: {
                state: "game",
                timerStarted: this.timerStarted,
                duration: gameTime
            }
        });

        PhysicsEngine.init();
        const level = new LevelMap("../level/level1.json", document.body);
        this.level = level;

        level.wait.then(() => {
            this.players = new Map();
            this.deviceInputs = new Map();
            this.startTimer();

            console.log("is angry:", this.data);


            eventListener.on("CLIENT_updateControllerData", (data) => {
                const device = getDevice(data.from);
                if (device === undefined) { return; }

                this.deviceInputs.set(device, data);
                console.log('CLIENT_updateControllerData');
            });

            const spawnpoints = level.getAllLevelObjectsByType(Spawnpoint);
            this.shuffle(spawnpoints);
            this.shuffle(spawnpoints);
            this.shuffle(spawnpoints);

            let index = 0;
            getAllDevices()
                .filter(e => e.deviceId !== 0)
                .forEach(e => {
                    if (!this.players.has(e)) {
                        console.log("create player for:", e.deviceId);
                        let player = new Player(level, vec2.clone(spawnpoints[index].position), Pawn);
                        this.players.set(e, player);
                        if(e === this.data){
                            level.setCameraPosition(player.pawn.position);
                        }
                        index++;
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

            // Engine.showDebugPlayer();

            PhysicsEngine.showDebugRenderer(level);
            PhysicsEngine.start();
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

  shuffle(array: any[]) {
    array.sort(() => Math.random() - 0.5);
  }
}
