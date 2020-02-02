import LevelObject from "./levelObject";
import Pawn from "./pawn";
import { Directions } from "../../common/enums";
import { LevelMap } from "./levelMap";
import { vec2, vec3 } from "gl-matrix";
import { Body, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";

const tmp = vec2.create();
const forceDefault = 0.001;

export class Player extends LevelObject {
    pawn: Pawn;
    private move: Set<Directions> = new Set();
    canTick = true;
    alive: boolean = true;

    constructor(
        levelMap: LevelMap,
        position: vec2,
        public pawnClass: typeof Pawn,
        isAngryDad: boolean
    ) {
        super(levelMap, position);
        this.pawn = new pawnClass(levelMap, vec2.clone(position), {isAngryDad});

        // this.registerInput();
    }

    kill(){
        this.alive = false;
        // World.remove(PhysicsEngine.world, this.pawn.interactionHitbox);
        World.remove(PhysicsEngine.world, this.pawn.killHitbox);
        this.pawn.view?.classList.remove("pawn", "angryDad", "heinzel");
    }

    tick(delta: number) {
        this.pawn.viewUpdate();
    }
}
export default Player;
