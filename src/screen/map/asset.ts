import LevelObject from "./levelObject";
import { vec2 } from "gl-matrix";
import { Bodies, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";
import Player from "./player";
import { ConnectedDevice } from "../../common/connectedDevice";

interface AssetMeta {
  size: vec2;
  class: string[];
  destructible?: boolean;
  health?: number;
}

export class Asset extends LevelObject {
  meta!: AssetMeta;
  currentHealth = 100;
  hit(value: number) {
    this.currentHealth += value;
    if (this.currentHealth <= 0) this.currentHealth = 0;
    if (this.currentHealth >= 100) this.currentHealth = 100;
    const view = super.render();
    view.classList.remove("nodamage", "littledamage", "destroyed");
    let clazz = "";
    if (this.currentHealth == 100) {
      clazz = "nodamage";
    } else if (this.currentHealth > 1 && this.currentHealth <= 99) {
      clazz = "littledamage";
    } else {
      clazz = "destroyed";
    }
    view.classList.add(clazz);
  }

  createPysics() {
    this.hitBox = Bodies.rectangle(
      this.position[0],
      this.position[1],
      this.meta.size[0],
      this.meta.size[1],
      {
        isStatic: true
      }
    );
    World.add(PhysicsEngine.world, [this.hitBox]);
  }

  render(): HTMLElement {
    const classes = this.meta.class ? this.meta.class : [];
    const view = super.render();
    view.classList.add("asset", ...classes);
    return view;
  }

  get isDestructable() {
    return !!this.meta.destructible;
  }
}
export default Asset;
