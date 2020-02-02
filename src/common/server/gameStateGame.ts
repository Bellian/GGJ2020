import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { GameStateChoose } from "./gameStateChoose";
import { ConnectedDevice, getAllDevices } from "../connectedDevice";
import {LevelMap} from '../../screen/map/levelMap';
import { vec2 } from "gl-matrix";
import { PhysicsEngine } from "../../screen/physicsEngine";

const eventListener = EventListener.get();
const gameTime = 120000;

export class GameStateGame extends GameState {
    nextState = GameStateChoose as any;
    timerStarted!: number;
    updateInterval: any;

    constructor(server: Server, data: ConnectedDevice){
        super(server, data);
    }

    tick(delta: number){
        
        if(this.timerStarted === undefined) {
            return;
        }
        const timeLeft = gameTime - (Date.now() - this.timerStarted);
        if(timeLeft <= 0){
            console.log('game is over, angry man won');
            this.exit();
        }
    }

    enter(){
        this.startTimer();
        this.server.airConsole.broadcast({
            action: 'updateState',
            data: {
                state: 'game',
                timerStarted: this.timerStarted,
                duration: gameTime,
            }
        });

        console.log('is angry:', this.data);

        eventListener.on('CLIENT_updateControllerData', (data: any) => {
            // console.log(data.from, data.doesAction, data.moveDirection);
        })

        this.updateInterval = setInterval(() => {
            const result: {[id: number]: any} = {};
            getAllDevices().forEach((e) => {
                result[e.deviceId] = {
                    position: vec2.create(),
                    direction: 'down'
                }
            });
            this.server.airConsole.broadcast({
                action: 'updatePlayer',
                data: result,
            })
        }, 1000 / 25);

        PhysicsEngine.init();
        const level = new LevelMap('../level/level1.json', document.body);

        level.wait.then(() => {
            // Engine.showDebugPlayer();
            PhysicsEngine.showDebugRenderer(level);
            PhysicsEngine.start();

        })
        
    }

    exit() {
        eventListener.off('CLIENT_updateControllerData')
        clearInterval(this.updateInterval);
        super.exit();
    }



    startTimer(){
        console.log('game started');
        this.timerStarted = Date.now();
    }

}