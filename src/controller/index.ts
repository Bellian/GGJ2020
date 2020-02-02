import {
  ControllerData,
  Client,
  ServerState,
  Server,
  ServerData
} from "../common/index";

import {EventListener} from '../common/eventListener';

const eventListener = EventListener.get();

export enum Views {
  splashscreen,
  characterselection,
  playscreen
}

interface JoyStickPosition{
  x:number
  y:number
}

class Controller {
  private joystick:Joystick;
  constructor(private client: Client) {
    this.joystick = new Joystick(client);
    this.onUpdateView();
    this.defaultView();
    // this.client.onUpdateServerData(this.updateView.bind(this));
  }

  private onUpdateView(){
    eventListener.on('SERVER_updateState', (view: any) => {
      this.updateView(view.state);
    });
  }

  // displays the current used view
  private showView(view: Views) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove("visible"));
    (document.querySelectorAll(Views[view])[0] as HTMLElement).classList.add(
      "visible"
    );
  }

  // initialize the desired view
  updateView(view:string) {
    switch (view) {
      case 'join':
        this.showView(Views.splashscreen);
        this.lobby();
        break;
      case 'choose':
        this.showView(Views.characterselection);
        this.characterselection();
        break;
      case 'game':
        this.showView(Views.playscreen);
        this.joystick.start();
        break;
      default:
        console.error("not implemented", view);
    }
  }

  // start the time for the lobby
  lobby() {
    this.setTime(Views.splashscreen, 30);
  }

  // change the character selection
  characterselection() {
    document.querySelectorAll('characterselection > characters > img').forEach(character => character.addEventListener('click', ()=>{
      if(character.classList.contains('angry-dad')){
        document.querySelectorAll('characterselection')[0].classList.add('isAngryDad');
        this.client.airConsole.setCustomDeviceState({wantAngry:true});
        console.log("You would like to be angry dad!");
      }else{
        document.querySelectorAll('characterselection')[0].classList.remove('isAngryDad');
        this.client.airConsole.setCustomDeviceState({wantAngry:false});
        console.log("You would like to be a wichtel!");
      }
    }));
    this.setTime(Views.characterselection, 15);
  }

  // sets the time element for an active view
  setTime(view: Views, timeUntil: number) {
    let timeUntilInterval = setInterval(() => {
      document.querySelectorAll(Views[view] + " time")[0].innerHTML = timeUntil.toString();
      timeUntil--;
      if (timeUntil <= 0) {
        clearInterval(timeUntilInterval);
      }
    }, 1000);
  }

  defaultView(){
    document.querySelectorAll('default button')[0].addEventListener('click', ()=>{
      location.reload();
    });
  }

}

class Joystick{
  private startPos: [number, number] | undefined = undefined;
  constructor(private client:Client){} //dont forget to start the joystick!
  // Joystick event handling
  private joystickMoveCallbacks: Set<(joystickPosition: JoyStickPosition) => void> = new Set();
  private onJoystickMove(cb: (joystickPosition: JoyStickPosition) => void) {
    this.joystickMoveCallbacks.add(cb);
  }

  private updateJoystickPosition(joystickPosition:JoyStickPosition) {
    this.joystickMoveCallbacks.forEach(e => e(joystickPosition));
  }

  private sendJoystickData(){
    this.onJoystickMove((pos)=>{
      this.client.moveAndInteract(pos.x, pos.y, false);
    });
  }

  // start the virtual controller
  start() {
    this.sendJoystickData();
    document
      .querySelectorAll("playscreen > controller")[0]
      .addEventListener("touchstart", ev => {
        this.startPos = [
          (ev as TouchEvent).targetTouches[0].clientX,
          (ev as TouchEvent).targetTouches[0].clientY
        ];
      });
    document
      .querySelectorAll("playscreen > controller")[0]
      .addEventListener("touchmove", ev => {
        if (this.startPos !== undefined) {
          this.updateJoystickPosition({x:((ev as TouchEvent).targetTouches[0].clientX - this.startPos[0]),y:-((ev as TouchEvent).targetTouches[0].clientY - this.startPos[1])});
        }
      });
    document
      .querySelectorAll("playscreen > controller")[0]
      .addEventListener("touchend", ev => {
        this.startPos = undefined;
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let client: Client = new Client();
  let controller = new Controller(client);
});
