import LevelObject from "./levelObject";
import Pawn from "./pawn";
import { Directions } from "../../common/enums";
import { LevelMap } from "./levelMap";
import { vec2, vec3 } from "gl-matrix";
import { Body } from "matter-js";

const tmp = vec2.create();
const forceDefault = 0.001;

export class Player extends LevelObject {

    pawn: Pawn;
    private move: Set<Directions> = new Set();
    canTick = true;

    constructor(
        levelMap: LevelMap,
        position: vec2,
        public pawnClass: typeof Pawn,
    ){
        super(levelMap, position);
        this.pawn = new pawnClass(levelMap, position);

        this.registerInput();
    }

    tick(delta: number) {
        if(this.move.size !== 0){
            vec2.set(tmp, 0,0);
            this.move.forEach(e => {
                switch(e){
                    case Directions.UP:
                        vec2.add(tmp, tmp, [0,-1]);
                        break;
                    case Directions.DOWN:
                        vec2.add(tmp, tmp, [0,1]);
                        break;
                    case Directions.LEFT:
                        vec2.add(tmp, tmp, [-1,0]);
                        break;
                    case Directions.RIGHT:
                        vec2.add(tmp, tmp, [1,0]);
                        break;
                }
            });
            vec2.normalize(tmp, tmp);
            Body.applyForce(this.pawn.hitBox!, this.pawn.hitBox!.position, {
                x: tmp[0] * forceDefault,
                y: tmp[1] * forceDefault
            });
        }
        
        this.position = vec2.fromValues(this.pawn.hitBox!.position.x, this.pawn.hitBox!.position.y);
        vec2.copy(this.pawn.position, this.position);
        this.levelMap.setCameraPosition(this.position);

        this.pawn.viewUpdate();
    }

    registerInput(){
        window.addEventListener('keydown', (e) => {
            switch(e.key){
                case 'w':
                    this.move.add(Directions.UP);
                    break;
                case 's':
                    this.move.add(Directions.DOWN);
                    break;
                case 'a':
                    this.move.add(Directions.LEFT);
                    break;
                case 'd':
                    this.move.add(Directions.RIGHT);
                    break;
            }
        })
        window.addEventListener('keyup', (e) => {
            switch(e.key){
                case 'w':
                    this.move.delete(Directions.UP);
                    break;
                case 's':
                    this.move.delete(Directions.DOWN);
                    break;
                case 'a':
                    this.move.delete(Directions.LEFT);
                    break;
                case 'd':
                    this.move.delete(Directions.RIGHT);
                    break;
            }
        })
    }
}
export default Player;