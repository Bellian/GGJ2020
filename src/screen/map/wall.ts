import LevelObject, { CollisionChannel } from "./levelObject";
import { vec2 } from "gl-matrix";
import { Bodies, World } from "matter-js";
import PhysicsEngine from "../physicsEngine";

interface WallMeta {
    size: vec2;
    class: string[];
}

export class Wall extends LevelObject {
    meta!: WallMeta;

    createPysics() {
        this.hitBox = Bodies.rectangle(this.position[0], this.position[1], this.meta.size[0], this.meta.size[1], {
            collisionFilter: {
                category: CollisionChannel.DEFAULT,
            },
            isStatic: true,
        });
        World.add(PhysicsEngine.world, [this.hitBox]);
    };

    render(): HTMLElement {
        const classes = this.meta.class ? this.meta.class : [];
        const view = super.render();
        view.classList.add('wall', 'center', ... classes);

        const side = document.createElement('div');
        side.classList.add('side');
        
        view.append(side);

        view.style.width = this.meta.size[0]+'px';
        view.style.height = this.meta.size[1]+'px';
        return view;
    }
}
export default Wall;