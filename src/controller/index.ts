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
  private startPos: [number, number] | undefined = undefined;
  constructor(private client: Client) {
    eventListener.on('SERVER_updateState', (state: any) => {
      console.log('game state changed', state.state);
      this.updateView(state.state);
    });
  }


  // Joystick event handling
  joystickMoveCallbacks: Set<(joystickPosition: JoyStickPosition) => void> = new Set();
  onJoystickMove(cb: (joystickPosition: JoyStickPosition) => void) {
    this.joystickMoveCallbacks.add(cb);
  }

  private updateJoystickPosition(joystickPosition:JoyStickPosition) {
    this.joystickMoveCallbacks.forEach(e => e(joystickPosition));
  }

  // displays the current used view
  private showView(view: Views) {
    (document.querySelectorAll(Views[view])[0] as HTMLElement).classList.add(
      "visible"
    );
    document.querySelectorAll('.view').forEach(view => view.classList.remove("visible"));
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
        this.virtualController();
        break;
      default:
        console.error("not implemented", view);
    }
  }

  // start the virtual controller
  private virtualController() {
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

  setTime(view: Views, timeUntil: number) {
    let timeUntilInterval = setInterval(() => {
      document.querySelectorAll(Views[view] + " time")[0].innerHTML = timeUntil.toString();
      timeUntil--;
      if (timeUntil <= 0) {
        clearInterval(timeUntilInterval);
      }
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let client: Client = new Client();
  let controller = new Controller(client);
  controller.onJoystickMove((pos)=>{
    console.log(pos);
  });
  //let test = new ServerData(30, ServerState.lobby);
  //controller.updateView(test);
});
