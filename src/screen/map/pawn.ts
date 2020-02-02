import LevelObject, { CollisionChannel } from "./levelObject";
import { Bodies, World, Body } from "matter-js";
import PhysicsEngine from "../physicsEngine";
import { LevelMap } from "./levelMap";
import { vec2 } from "gl-matrix";

export class Pawn extends LevelObject {
  radius: number = 10;
  direction: string = "down";
  interactionHitbox!: Body;
  killHitbox!: Body;

  constructor(
    levelMap: LevelMap,
    position: vec2,
    meta?: any
  ) {
    super(levelMap, position, meta);
  }
  createPysics() {
    this.killHitbox = Bodies.circle(this.position[0], this.position[1], 12, {
        isSensor: true,
        collisionFilter: {
            category: CollisionChannel.PLAYER,
        }
    });
    this.interactionHitbox = Bodies.circle(this.position[0], this.position[1], 12, {
        isSensor: true,
        collisionFilter: {
            category: CollisionChannel.PLAYER,
            mask: CollisionChannel.DEFAULT,
        }
    });
    this.hitBox = Bodies.circle(this.position[0], this.position[1], 10, {
        collisionFilter: {
            category: CollisionChannel.PLAYER,
            mask: CollisionChannel.DEFAULT,
        },
        frictionStatic: 1,
        frictionAir: 0.4
    });
    World.add(PhysicsEngine.world, [this.hitBox, this.interactionHitbox, this.killHitbox]);
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
