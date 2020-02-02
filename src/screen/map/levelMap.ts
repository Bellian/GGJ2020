import { vec2 } from "gl-matrix";

import Authority from '../../common/authority';
import {Directions} from '../../common/enums';
import PhysicsEngine from '../physicsEngine';
import { World, Bodies, Body, Engine, Events } from "matter-js";
import LevelObject from "./levelObject";
import Pawn from "./pawn";
import Player from "./player";
import Wall from "./wall";
import Floor from "./floor";
import { Placeholder } from "./placeholder";
import { Asset } from "./asset";
import Spawnpoint from "./spawnpoint";

interface LevelObjectData {
    type: string;
    pos: [number, number];
    meta: any;
}
interface LevelData {
    size: [number, number];
    objectData: LevelObjectData[];
}

export class LevelMap {

    wait: Promise<void>;
    objects: Array<LevelObject> = [];

    gameContainer!: HTMLElement;
    cameraElement!: HTMLElement;
    sceneContainer!: HTMLElement;
    mapContainer!: HTMLElement;


    size!: vec2;

    lastTimestamp: number = 0;

    constructor(public url: string, public mainContainer: HTMLElement) {
        this.wait = fetch(url).then((result) => {
            return result.json();
        }).then((json: LevelData) => {
            this.parse(json);
        })
    }

    parse(json: LevelData) {
        this.size = vec2.fromValues(json.size[0], json.size[1]);
        this.createBounds();

        this.createContainer();
        // parse levelObjects
        json.objectData.forEach((data) => {
            switch(data.type){
                case 'wall':
                    new Wall(this, vec2.fromValues(... data.pos) as vec2, data.meta);
                    break;
                case 'floor':
                    new Floor(this, vec2.fromValues(... data.pos) as vec2, data.meta);
                    break;
                case 'asset':
                    new Asset(this, vec2.fromValues(... data.pos) as vec2, data.meta);
                    break;
                case 'spawnpoint':
                    new Spawnpoint(this, vec2.fromValues(... data.pos) as vec2, data.meta);
                    break;
                default:
                    new Placeholder(this, vec2.fromValues(... data.pos) as vec2, data.meta);
                    break;
            }
        });


        Events.on(PhysicsEngine.engine, 'beforeUpdate', (event) => {
            const delta = (event.timestamp - this.lastTimestamp) / 1000; // convert to sec
            this.lastTimestamp = event.timestamp;

            for(let object of this.objects) {
                if(object.canTick) {
                    object.tick(delta);
                }
            }
        });

        // create player
        new Player(this, vec2.fromValues(10,10), Pawn);

    }

    createBounds() {
        if(!Authority.get().hasAuthority()){
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

    createContainer (){
        this.gameContainer = document.createElement('div');
        this.gameContainer.classList.add('game-container');

        this.cameraElement = document.createElement('div');
        this.cameraElement.classList.add('camera');

        this.sceneContainer = document.createElement('div');
        this.sceneContainer.classList.add('scene');

        this.mapContainer = document.createElement('div');
        this.mapContainer.classList.add('map');
        this.mapContainer.style.width = this.size[0] + 'px';
        this.mapContainer.style.height = this.size[1] + 'px';

        this.mainContainer.append(this.gameContainer);
        this.gameContainer.append(this.cameraElement);
        this.cameraElement.append(this.sceneContainer);
        this.sceneContainer.append(this.mapContainer);

        this.setCameraPosition(vec2.scale(vec2.create(), this.size, 0.5));
    }

    setCameraPosition(position: vec2){
        this.mapContainer.style.transform = `translateX(${-position[0]}px) translateY(${-position[1]}px)`;
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



