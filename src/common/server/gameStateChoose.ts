import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { getDevice, getAllDevices } from "../connectedDevice";

const eventListener = EventListener.get();

const duration = 3000;

export class GameStateChoose extends GameState {
    //nextState = undefined;

    duration: number = duration;
    timerStarted!: number;
    nextState = GameState as any;

    constructor(server: Server){
        super(server);
    }

    enter(){
        this.startTimer();
        this.server.airConsole.broadcast({
            action: 'updateState',
            data: {
                state: 'choose',
                timerStarted: this.timerStarted,
                duration,
            }
        })
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

    exit() {
        let angry = undefined;
        const devices = getAllDevices();
        const candidates = devices.filter(e => e.customStateData.wantAngry);
        if(candidates.length === 0) {
            // fuck u all and pick random
            angry = devices[Math.floor(devices.length * Math.random())];
        } else {
            angry = candidates[Math.floor(candidates.length * Math.random())];
        }

        console.log('and the winner is:', angry, devices, candidates);

        getAllDevices().forEach((e) => {
            console.log(e.customStateData);
        })
        super.exit();
    }

    startTimer(){
        console.log('player joined, starting timer');
        this.timerStarted = Date.now();
    }

}