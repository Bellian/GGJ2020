import LevelObject, { CollisionChannel } from "./levelObject";
import { Bodies, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";
import { LevelMap } from "./levelMap";
import { vec2 } from "gl-matrix";

export class Pawn extends LevelObject {
  radius: number = 10;
  direction: string = "down";

  constructor(
    levelMap: LevelMap,
    position: vec2,
    meta?: any
  ) {
    super(levelMap, position, meta);
  }
  createPysics() {
    this.hitBox = Bodies.circle(this.position[0], this.position[1], 10, {
        collisionFilter: {
            category: CollisionChannel.PLAYER,
            mask: CollisionChannel.DEFAULT,
        },
        frictionStatic: 1,
        frictionAir: 0.4
    });
    World.add(PhysicsEngine.world, [this.hitBox]);
  }

  move(direction: "up" | "down" | "left" | "right") {
    this.view!.classList.remove("up", "down", "left", "right");
    this.view!.classList.add(direction);
    this.direction = direction;
  }

  render(): HTMLElement {
      console.log('render', this.meta.isAngryDad);
    const view = super.render();
    view.classList.add("pawn", this.meta.isAngryDad ? "angryDad" : "heinzel");
    return view;
  }
}
export default Pawn;
