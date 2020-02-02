import { LevelMap } from "./levelMap";
import { vec2 } from "gl-matrix";
import Authority from "../../common/authority";
import { World, Body } from "matter-js";
import PhysicsEngine from "../physicsEngine";

export abstract class LevelObject {

    hitBox: Body | undefined;
    view: HTMLElement | undefined;
    canTick: boolean = false;

    constructor(public levelMap: LevelMap, public position: vec2, public meta?: any){
        levelMap.addLevelObject(this);
        this.gateCreatePhysics();
        this.render();
    }

    private gateCreatePhysics(){
        // console.log('init physics', Authority.get().hasAuthority());
        // if(!Authority.get().hasAuthority()){
        //     return;
        // }
        this.createPysics();
    }

    tick(delta: number) {
        
    }

    createPysics() {};

    destroy() {
        if(this.hitBox) {
            World.remove(PhysicsEngine.world, this.hitBox);
        }
    }

    viewUpdate() {
        this.view!.style.left = this.position[0] + 'px';
        this.view!.style.top = this.position[1] + 'px';
    }

    render(): HTMLElement {
        this.view = document.createElement('div');
        this.levelMap.mapContainer.append(this.view);
        this.viewUpdate();
        this.view.classList.add('level-object'); 
        return this.view;
    }
}
export default LevelObject;