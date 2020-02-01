import LevelObject from "./levelObject";
import { Bodies, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";

export class Pawn extends LevelObject {

    radius: number = 10;

    createPysics() {
        this.hitBox = Bodies.circle(5, 5, 10, {
            frictionStatic: 1,
            frictionAir: 0.4
        });
        World.add(PhysicsEngine.world, [this.hitBox]);
    };

    render(): HTMLElement {
        const view = super.render();
        view.classList.add('pawn');
        return view;
    }
}
export default Pawn;