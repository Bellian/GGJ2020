import { LevelMap } from "./map/levelMap";
import Engine from './physicsEngine';
import Authority from "../common/authority";
import { Server } from "../common/server";
import { glMatrix } from "gl-matrix";

glMatrix.setMatrixArrayType(Array);
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

    new Sound('../sound/main.mp3').play();

});


class Sound{
    soundElement:HTMLAudioElement;
    constructor(src:string) {
        this.soundElement = document.createElement("audio");
        this.soundElement.src = src;
        this.soundElement.setAttribute("preload", "auto");
        this.soundElement.setAttribute("controls", "none");
        this.soundElement.style.display = "none";
        document.body.appendChild(this.soundElement);
    }
    play(){
        this.soundElement.play();
    }
    stop(){
        this.soundElement.pause();
    }
}

