import { Server } from "../server";
import { EventListener } from "../eventListener";

const eventListener = EventListener.get();
type GameStateDoneCallback = (newGameState: GameState) => void;

export class GameState {

    nextState!: typeof GameState;
    callback!: GameStateDoneCallback;

    constructor(public server: Server){
        this.enter();
    }

    tick(delta: number) {
        
    }

    enter() {

    };


    exit(){
        const newState = new this.nextState(this.server);
        eventListener.trigger('newGameState', newState);
    }

    onExit( cb: GameStateDoneCallback) {
        this.callback = cb;
    }

}