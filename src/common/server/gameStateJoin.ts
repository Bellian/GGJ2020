import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { GameStateChoose } from "./gameStateChoose";

const eventListener = EventListener.get();

export class GameStateJoin extends GameState {
    //nextState = undefined;

    nextState = GameStateChoose as any;

    timerStarted!: number;
    deviceJoinedCallback: any;
    
    constructor(server: Server, public duration: number){
        super(server);
    }

    tick(delta: number){
        if(this.timerStarted === undefined) {
            return;
        }
        const timeLeft = this.duration - (Date.now() - this.timerStarted);
        if(timeLeft <= 0){
            console.log('timer is up, next state');
            this.exit();
        }
    }

    enter(){
        this.deviceJoinedCallback = eventListener.on('deviceJoined', (device) => {
            if(!this.timerStarted){
                this.startTimer();
            }
            this.server.airConsole.message(device.deviceId, {
                action: 'updateState',
                data: {
                    state: 'join',
                    timerStarted: this.timerStarted,
                    duration: this.duration,
                }
            })
        });
    }

    exit() {
        eventListener.off('deviceJoined', this.deviceJoinedCallback);
        this.server.airConsole.setActivePlayers(4);
        super.exit();
    }

    startTimer(){
        console.log('player joined, starting timer');
        this.timerStarted = Date.now();
    }

}