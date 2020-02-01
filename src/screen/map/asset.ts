import LevelObject from "./levelObject";
import { vec2 } from "gl-matrix";
import { Bodies, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";

interface AssetMeta {
    size: vec2;
    class: string[];
    destructible?: boolean;
    health?: number;
}

export class Asset extends LevelObject {
    meta!: AssetMeta;

    createPysics() {
        this.hitBox = Bodies.rectangle(this.position[0], this.position[1], this.meta.size[0], this.meta.size[1], {
            isStatic: true,
        });
        World.add(PhysicsEngine.world, [this.hitBox]);
    };

    render(): HTMLElement {
        const classes = this.meta.class ? this.meta.class : [];
        const view = super.render();
        view.classList.add('asset', ... classes);
        return view;
    }

    get isDestructable(){
        return !!this.meta.destructible;
    }
}
export default Asset;