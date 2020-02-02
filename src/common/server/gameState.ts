import { Server } from "../server";
import { EventListener } from "../eventListener";

const eventListener = EventListener.get();
type GameStateDoneCallback = (newGameState: GameState) => void;

export class GameState {

    nextState!: typeof GameState;
    callback!: GameStateDoneCallback;

    constructor(public server: Server, public data?: any){
        this.enter();
    }

    tick(delta: number) {
        
    }

    enter() {

    };


    exit(data?: any){
        const newState = new this.nextState(this.server, data);
        eventListener.trigger('newGameState', newState);
    }

    onExit( cb: GameStateDoneCallback) {
        this.callback = cb;
    }

}