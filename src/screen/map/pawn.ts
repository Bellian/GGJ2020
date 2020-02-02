import LevelObject from "./levelObject";
import { Bodies, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";
import { LevelMap } from "./levelMap";
import { vec2 } from "gl-matrix";

export class Pawn extends LevelObject {
  constructor(
    levelMap: LevelMap,
    position: vec2,
    isAngryDad: boolean,
    meta?: any
  ) {
    super(levelMap, position, meta);
    this.isAngryDad = isAngryDad;
  }
  radius: number = 10;
  direction: string = "down";
  isAngryDad: boolean;
  createPysics() {
    this.hitBox = Bodies.circle(5, 5, 10, {
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
    const view = super.render();
    view.classList.add("pawn", this.isAngryDad ? "angryDad" : "heinzel");
    return view;
  }
}
export default Pawn;
