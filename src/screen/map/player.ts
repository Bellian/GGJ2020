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
        isAngryDad: boolean
    ) {
        super(levelMap, position);
        this.pawn = new pawnClass(levelMap, vec2.clone(position), isAngryDad);

        // this.registerInput();
    }

    tick(delta: number) {
        this.pawn.viewUpdate();
    }
}
export default Player;
