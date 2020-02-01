import LevelObject from "./levelObject";
import { vec2 } from "gl-matrix";
import { Bodies, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";

interface WallMeta {
    size: vec2;
    class: string[];
}

export class Floor extends LevelObject {
    meta!: WallMeta;

    render(): HTMLElement {
        const view = super.render();
        view.classList.add('floor', 'center', ... this.meta.class);

        view.style.width = this.meta.size[0]+'px';
        view.style.height = this.meta.size[1]+'px';
        return view;
    }
}
export default Floor;