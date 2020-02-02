import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { getDevice, getAllDevices } from "../connectedDevice";
import { GameStateGame } from "./gameStateGame";

const eventListener = EventListener.get();

const chooseTime = 15000;

export class GameStateChoose extends GameState {
    //nextState = undefined;

    duration: number = chooseTime;
    timerStarted!: number;
    nextState = GameStateGame as any;

    constructor(server: Server) {
        super(server);
    }

    enter() {
        this.startTimer();
        this.server.airConsole.broadcast({
            action: "updateState",
            data: {
                state: "choose",
                timerStarted: this.timerStarted,
                duration: chooseTime
            }
        });
    }

    tick(delta: number) {
        if (this.timerStarted === undefined) {
            return;
        }
        const timeLeft = chooseTime - (Date.now() - this.timerStarted);
        if (timeLeft <= 0) {
            console.log("timer is up, next state");
            this.exit();
        }
    }

    exit() {
        let angry = undefined;
        const devices = getAllDevices();
        const candidates = devices.filter(
            e => e.customStateData && e.customStateData.wantAngry
        );
        if (candidates.length === 0) {
            // fuck u all and pick random
            angry = devices[Math.floor(devices.length * Math.random())];
        } else {
            angry = candidates[Math.floor(candidates.length * Math.random())];
        }

        console.log("candidates:", candidates);
        console.log("devices:", devices);
        console.log("and the winner is:", angry);

        super.exit(angry);
    }

    startTimer() {
        console.log("player joined, starting timer");
        this.timerStarted = Date.now();
    }
}
