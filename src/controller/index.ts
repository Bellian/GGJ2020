import { ControllerData, Client, ServerState, Server } from '../common/index';

enum Views {
    splashscreen,
    characterselection,
    playscreen,
    endscreen
}

class Controller{
    private startPos:[number, number] | undefined = undefined;
    constructor(private client:Client){
        document.addEventListener('DOMContentLoaded', () => {
            this.virtualController();
            this.client.updateServerState(this.updateView);
        });
    }

    showView(view:Views){
        (document.querySelectorAll(Views[view])[0] as HTMLElement).classList.add('visible');
    }

    hideView(view:Views){
        (document.querySelectorAll(Views[view])[0] as HTMLElement).classList.remove('visible');
    }

    updateView(serverState:ServerState){
        switch(serverState){
            case ServerState.lobby:
                this.showView(Views.splashscreen);
                break;
            case ServerState.characterSelection:
                this.showView(Views.characterselection)
                break;
            case ServerState.running:
                this.showView(Views.playscreen)
                break;
            case ServerState.final:
                this.showView(Views.endscreen)
                break;
            default:
                console.error('not implemented', serverState);
        }
    }

    virtualController(){
        document.querySelectorAll('controller')[0].addEventListener('touchstart', (ev) => {
            console.log('touchstart');
            this.startPos = [(ev as TouchEvent).targetTouches[0].clientX, (ev as TouchEvent).targetTouches[0].clientY];
        });
        document.querySelectorAll('controller')[0].addEventListener('touchmove', (ev) => {
            if(this.startPos !== undefined) {
                this.client.sendControllerData(new ControllerData((ev as TouchEvent).targetTouches[0].clientX - this.startPos[0], (ev as TouchEvent).targetTouches[0].clientY - this.startPos[1]));
            }
        });
        document.querySelectorAll('controller')[0].addEventListener('touchend', (ev) => {
            this.startPos = undefined;
        });
    }

    splashscreen(){
        document.querySelectorAll('splashscreen > button').forEach( btn => {
            let character = document.querySelectorAll('splashscreen > character')[0];
            let isPlayerAngryDad = this.client.toggleAngryDad();
            if (isPlayerAngryDad){
                character.innerHTML = 'You would like to be angry dad!';
            }else{
                character.innerHTML = 'You would like to be a wichtel!';
            }
        });
        let timeUntilStartInterval = setInterval(() => {
            let timeUntilStart = this.client.getTimeUntilStart();
            document.querySelectorAll('splashscreen > time')[0].innerHTML = timeUntilStart;
            if(timeUntilStart === 0){
                clearInterval(timeUntilStartInterval);
            }
        }, 1000);
    }
}



let client:Client = new Client();
new Controller(client);