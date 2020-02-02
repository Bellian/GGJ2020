import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { GameStateChoose } from "./gameStateChoose";

const eventListener = EventListener.get();
const gameTime = 120000;

export class GameStateGame extends GameState {
    nextState = GameStateChoose as any;
    timerStarted!: number;

    constructor(server: Server, public duration: number){
        super(server);
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
                state: 'choose',
                timerStarted: this.timerStarted,
                duration: gameTime,
            }
        })
    }

    exit() {
        super.exit();
    }



    startTimer(){
        console.log('game started');
        this.timerStarted = Date.now();
    }

}