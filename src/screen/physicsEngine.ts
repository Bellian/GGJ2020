import { Engine, Gravity, Runner, Render, Bodies, World, Events, Body } from "matter-js";
import { vec2 } from "gl-matrix";
import { LevelMap } from "./map/levelMap";
import { Directions } from "../common/enums";

const maxDebugMapSize = 250;

export class PhysicsEngine {

    static engine: Engine;
    static world: World;
    static runner: Runner;
    static render: Render;
    static debugElement: HTMLElement;

    static init(){
        this.engine = Engine.create();

        this.world = this.engine.world;
        this.world.gravity = {
            scale: 0,
            x: 0,
            y: 0
        } as Gravity;

        this.runner = Runner.create();

    }

    static start() {
        Runner.run(this.runner, this.engine);
    }

    static stop() {
        Runner.stop(this.runner);
    }

    static showDebugRenderer(map: LevelMap) {
        if(this.render === undefined){
            const scale = Math.min(maxDebugMapSize / map.size[0], maxDebugMapSize / map.size[1]);

            const element = document.createElement('div');
            element.style.position = 'fixed';
            element.style.top = '5px';
            element.style.left = '5px';
            element.style.transformOrigin = 'top left';
            element.style.transform = 'scale('+scale.toFixed(4)+')';

            this.render = Render.create({
                element,
                engine: this.engine,
                options: {
                    width: map.size[0],
                    height: map.size[1],
                    wireframes: false,
                }
            });
        
            (Render as any).lookAt(this.render, {
                min: { x: 0, y: 0 },
                max: { x: map.size[0], y: map.size[1] }
            });
            this.debugElement = element;
        }
        Render.run(this.render);
        document.body.append(this.debugElement);
    }

    static hideDebugRenderer() {
        Render.stop(this.render);
        document.body.removeChild(this.debugElement);
    }

    static showDebugPlayer() {
        const player = Bodies.circle(5, 5, 10, {
            frictionStatic: 1,
            frictionAir: 0.4
        });
        World.add(this.world, [player]);
    
        Events.on(this.engine, 'beforeUpdate', function(event) {
            const dir = vec2.create();
            if(move.size === 0){
                return;
            }
            move.forEach(e => {
                switch(e){
                    case Directions.UP:
                        vec2.add(dir, dir, [0,-1]);
                        break;
                    case Directions.DOWN:
                        vec2.add(dir, dir, [0,1]);
                        break;
                    case Directions.LEFT:
                        vec2.add(dir, dir, [-1,0]);
                        break;
                    case Directions.RIGHT:
                        vec2.add(dir, dir, [1,0]);
                        break;
                }
            });
            vec2.normalize(dir, dir);
            Body.applyForce(player, player.position, {
                x: dir[0] * 0.001,
                y: dir[1] * 0.001
            })
        });
    
        const move = new Set<number>();
    
        window.addEventListener('keydown', (e) => {
            switch(e.key){
                case 'w':
                    move.add(Directions.UP);
                    break;
                case 's':
                    move.add(Directions.DOWN);
                    break;
                case 'a':
                    move.add(Directions.LEFT);
                    break;
                case 'd':
                    move.add(Directions.RIGHT);
                    break;
            }
        })
        window.addEventListener('keyup', (e) => {
            switch(e.key){
                case 'w':
                    move.delete(Directions.UP);
                    break;
                case 's':
                    move.delete(Directions.DOWN);
                    break;
                case 'a':
                    move.delete(Directions.LEFT);
                    break;
                case 'd':
                    move.delete(Directions.RIGHT);
                    break;
            }
        })
    }
}

export default PhysicsEngine;

