import {
  ControllerData,
  Client,
  ServerState,
  Server,
  ServerData
} from "../common/index";

export enum Views {
  splashscreen,
  characterselection,
  playscreen,
  endscreen
}

class Controller {
  private startPos: [number, number] | undefined = undefined;
  constructor(private client: Client) {
    this.client.onUpdateServerData(this.updateView.bind(this));
  }

  showView(view: Views) {
    (document.querySelectorAll(Views[view])[0] as HTMLElement).classList.add(
      "visible"
    );
  }

  hideView(view: Views) {
    (document.querySelectorAll(Views[view])[0] as HTMLElement).classList.remove(
      "visible"
    );
  }

  updateView(serverData: ServerData) {
    console.log(
      "new server state received",
      ServerState[serverData.serverState]
    );
    switch (serverData.serverState) {
      case ServerState.lobby:
        this.showView(Views.splashscreen);
        this.lobby();
        break;
      case ServerState.characterSelection:
        this.showView(Views.characterselection);
        this.characterselection();
        break;
      case ServerState.running:
        this.showView(Views.playscreen);
        this.virtualController();
        break;
      case ServerState.final:
        this.showView(Views.endscreen);
        break;
      default:
        console.error("not implemented", serverData);
    }
  }

  virtualController() {
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
          this.client.sendControllerData(
            new ControllerData(
              (ev as TouchEvent).targetTouches[0].clientX - this.startPos[0],
              (ev as TouchEvent).targetTouches[0].clientY - this.startPos[1]
            )
          );
        }
      });
    document
      .querySelectorAll("playscreen > controller")[0]
      .addEventListener("touchend", ev => {
        this.startPos = undefined;
      });
  }

  lobby() {
    this.setTime(Views.splashscreen);
  }

  characterselection() {
    document.querySelectorAll("characterselection > button").forEach(btn => {
      let isPlayerAngryDad = this.client.toggleAngryDad();
      if (isPlayerAngryDad) {
        document
          .querySelectorAll("characterselection")[0]
          .classList.add("isAngryDad");
        console.log("You would like to be angry dad!");
      } else {
        document
          .querySelectorAll("characterselection")[0]
          .classList.remove("isAngryDad");
        console.log("You would like to be a wichtel!");
      }
    });
    this.setTime(Views.characterselection);
  }

  setTime(view: Views) {
    let timeUntilInterval = setInterval(() => {
      let timeUntil = this.client.getTime();
      document.querySelectorAll(
        Views[view] + " > time"
      )[0].innerHTML = timeUntil.toString();
      if (timeUntil === 0) {
        clearInterval(timeUntilInterval);
      }
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let client: Client = new Client();
  let controller = new Controller(client);
  //let test = new ServerData(30, ServerState.lobby);
  //controller.updateView(test);
});
