import { GameState } from "./gameState";
import { EventListener } from "../eventListener";
import { Server } from "../server";
import { GameStateChoose } from "./gameStateChoose";

const eventListener = EventListener.get();
const joinTime = 5000;
export class GameStateEnd extends GameState {
    //nextState = undefined;

    nextState = GameStateEnd as any;

    enter(){
        this.server.airConsole.broadcast({
            action: 'updateState',
            data: {
                state: 'end',
                angryWon: this.data,
            }
        })
    }

}