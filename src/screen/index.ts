import { LevelMap } from "./map/levelMap";
import Engine from './physicsEngine';


document.addEventListener('DOMContentLoaded', () => {
    Engine.init();
    const level = new LevelMap('/level/level1.json');

    level.wait.then(() => {
        Engine.showDebugPlayer();
        Engine.showDebugRenderer(level);
        Engine.start();
    })
});


