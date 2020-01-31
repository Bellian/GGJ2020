import { ControllerData } from '../common/index';

class Controller{
    private startPos:[number, number] | undefined = undefined;
    constructor(){
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init(){
        document.querySelectorAll('controller')[0].addEventListener('touchstart', (ev) => {
            console.log('touchstart');
            this.startPos = [(ev as TouchEvent).targetTouches[0].clientX, (ev as TouchEvent).targetTouches[0].clientY];
        });
        document.querySelectorAll('controller')[0].addEventListener('touchmove', (ev) => {
            if(this.startPos !== undefined) {
                new ControllerData((ev as TouchEvent).targetTouches[0].clientX - this.startPos[0], (ev as TouchEvent).targetTouches[0].clientY - this.startPos[1]);
            }
        });
        document.querySelectorAll('controller')[0].addEventListener('touchend', (ev) => {
            this.startPos = undefined;
        });
    }
}

new Controller();