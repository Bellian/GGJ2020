import { vec2 } from "gl-matrix";

import Authority from '../../common/authority';
import PhysicsEngine from '../physicsEngine';
import { World, Bodies } from "matter-js";

interface LevelObjectData {
    type: string;
    position: [number, number];
    meta: any;
}
interface LevelData {
    size: [number, number];
    objectData: LevelObjectData[];
}

export class LevelMap {

    wait: Promise<void>;
    objects: Array<LevelObject> = [];

    size!: vec2;

    constructor(public url: string) {
        this.wait = fetch(url).then((result) => {
            return result.json();
        }).then((json: LevelData) => {
            this.parse(json);
        })
    }

    parse(json: LevelData) {
        this.size = vec2.fromValues(json.size[0], json.size[1]);
        this.createBounds();

        // parse levelObjects
    }

    createBounds() {
        if(Authority.get().hasAuthority()){
            return;
        }
        const width = this.size[0];
        const height = this.size[1];

        World.add(PhysicsEngine.world, [
            Bodies.rectangle(width/2,   -50,        width,  100,             { isStatic: true }),
            Bodies.rectangle(width/2,   height+50,  width,  100,             { isStatic: true }),
            Bodies.rectangle(width+50,  height/2,   100,    height + 200,    { isStatic: true }),
            Bodies.rectangle(-50,       height/2,   100,    height + 200,    { isStatic: true })
        ]);
    }


    addLevelObject(object: LevelObject) {
        this.objects.push(object);
    }

    getAllLevelObjects() {
        return this.objects.slice();
    }

    getAllLevelObjectsByType<T extends LevelObject>(type: typeof LevelObject): T[] {
        return this.objects.filter((e) => e instanceof type) as any;
    }
}

abstract class LevelObject {

    constructor(public LevelMap: LevelMap, public position: vec2, public meta: any){
        LevelMap.addLevelObject(this);
        this.gateCreatePhysics();
    }

    private gateCreatePhysics(){
        if(Authority.get().hasAuthority()){
            return;
        }
        this.createPysics();
    }

    createPysics() {};

    render(): HTMLElement {
        return document.createElement('div');
    }
}