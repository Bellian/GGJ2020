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
import { Body, Events, Bodies } from "matter-js";
import { GameStateEnd } from "./gameStateEnd";

const eventListener = EventListener.get();
const gameTime = 1200000;
const forceDefault = 0.001;

let tmp = vec2.create();

export class GameStateGame extends GameState {
    nextState = GameStateEnd as any;
    timerStarted!: number;
    updateInterval: any;
    players!: Map<ConnectedDevice, Player>;
    deviceInputs!: Map<
        ConnectedDevice,
        {
            from: number;
            doesAction: boolean;
            moveDirection: vec2;
            isTouching: boolean;
        }
    >;
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
            console.log("game is over, angry man lost");
            this.exit(false);
        }
        let alive = false;
        this.players.forEach((player) => {
            if(player !== this.players.get(this.data) && player.alive){
                alive = true;
            }
        })
        if(!alive){
            this.exit(true);
        }

        getAllDevices()
            .filter(device => device.deviceId !== 0)
            .forEach(device => {
                const player = this.players.get(device);
                if (player === undefined) { return; }
                const data = this.deviceInputs.get(device);
                if (data === undefined) { return; }
                if (!data.isTouching) {
                    return;
                }

                vec2.copy(tmp, data.moveDirection);
                vec2.scale(tmp, tmp, 1 / 50);
                const length = Math.min(vec2.length(tmp), 1);
                vec2.normalize(tmp, tmp);

                const dir = vec2.round(vec2.create(), tmp)
                let dirString = 'up';
                if (dir[1] === -1) {
                    dirString = 'down';
                } else if (dir[1] === 1) {
                    dirString = 'up';
                } else if (dir[0] === -1) {
                    dirString = 'left';
                } else if (dir[0] === 1) {
                    dirString = 'right';
                }
                player.pawn.move(dirString as any);

                vec2.scale(tmp, tmp, length);

                Body.applyForce(player.pawn.hitBox!, player.pawn.hitBox!.position, {
                    x: tmp[0] * forceDefault,
                    y: -tmp[1] * forceDefault,
                });
                Body.setPosition(player.pawn.interactionHitbox, player.pawn.hitBox?.position!)
                Body.setPosition(player.pawn.killHitbox, player.pawn.hitBox?.position!)

                player.position = vec2.fromValues(player.pawn.hitBox!.position.x, player.pawn.hitBox!.position.y);

                vec2.copy(player.pawn.position, player.position);
                player.pawn.viewUpdate();

                if (device === this.data) {
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
                duration: gameTime,
                angry: this.data.deviceId,
            }
        });

        PhysicsEngine.init();
        this.initCollision();
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
                        let player = new Player(level, vec2.clone(spawnpoints[index].position), Pawn, e.deviceId === this.data.deviceId);
                        this.players.set(e, player);
                        if (e === this.data) {
                            level.setCameraPosition(player.pawn.position);
                        }
                        index++;
                    }
                });

            this.updateInterval = setInterval(() => {
                const result: { [id: number]: any } = {};
                getAllDevices()
                    .filter(e => e.deviceId !== 0 && this.players.get(e)?.alive)
                    .forEach(e => {
                        let player = this.players.get(e);
                        result[e.deviceId] = {
                            position: player!.pawn!.position,
                            direction: player!.pawn!.direction,
                        };
                    });
                this.server.airConsole.broadcast({
                    action: "updatePlayer",
                    data: result
                });
            }, 1000 / 20);

            // Engine.showDebugPlayer();

            PhysicsEngine.showDebugRenderer(level);
            PhysicsEngine.start();
        });
    }

    initCollision(){
        Events.on(PhysicsEngine.engine, 'collisionStart', (event) => {
            var pairs = event.pairs;
            
            for (var i = 0, j = pairs.length; i != j; ++i) {
                var pair = pairs[i];
    
                if (pair.bodyA === this.players.get(this.data)?.pawn.killHitbox) {
                    getAllDevices().filter(e => e.deviceId !== 0 && e !== this.data).forEach(e => {
                        if(pair.bodyB === this.players.get(e)?.pawn.killHitbox){
                            console.log('angry man collided with player', e, pair.bodyA === pair.bodyB);
                            this.players.get(e)!.alive = false;
                            this.players.get(e)!.kill();
                            this.server.airConsole.broadcast({
                                action:'playerKilled',
                                data: e.deviceId,
                            })
                        }
                    })
                }
                if (pair.bodyB === this.players.get(this.data)?.pawn.killHitbox) {
                    getAllDevices().filter(e => e.deviceId !== 0 && e !== this.data).forEach(e => {
                        if(pair.bodyA === this.players.get(e)?.pawn.killHitbox){
                            console.log('angry man collided with player', e, pair.bodyA === pair.bodyB);
                            this.players.get(e)!.kill();
                            this.server.airConsole.broadcast({
                                action:'playerKilled',
                                data: e.deviceId,
                            })
                        }
                    })
                }
            }
        });
    
        Events.on(PhysicsEngine.engine, 'collisionEnd', (event) => {
            var pairs = event.pairs;
            
            for (var i = 0, j = pairs.length; i != j; ++i) {
                
            }
        });
    }


    exit(data?: any) {
        eventListener.off("CLIENT_updateControllerData");
        clearInterval(this.updateInterval);
        super.exit(data);
    }

    startTimer() {
        console.log("game started");
        this.timerStarted = Date.now();
    }

    shuffle(array: any[]) {
        array.sort(() => Math.random() - 0.5);
    }
}
