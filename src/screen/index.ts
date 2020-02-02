import { LevelMap } from "./map/levelMap";
import Engine from './physicsEngine';
import Authority from "../common/authority";
import { Server } from "../common/server";

Authority.get().requestAuthority();

document.addEventListener('DOMContentLoaded', () => {

    let server:Server = new Server();

    /*

    const level = new LevelMap('../level/level1.json', document.body);

    level.wait.then(() => {
        // Engine.showDebugPlayer();
        Engine.showDebugRenderer(level);
        Engine.start();

    })
    
    */
});


