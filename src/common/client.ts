declare const AirConsole: any;
import {
  TransactionTypeInterface,
  ControllerData,
  TransactionType,
  ServerState,
  PlayerData,
  CharacterAppearanceType,
  ServerData,
  ObjectData,
  ServerUpdateData,
  ObjectUpdateData,
  PlayerUpdateData,
  PlayerState,
  AirConsoleMessage,
  AirConsoleControllerUpdate,
  AirConsoleCharacterAppearanceUpdate
} from "./index";
import { EventListener } from "./eventListener";
import { ConnectedDevice, getDevice, getAllDevices } from "./connectedDevice";
import { vec2 } from "gl-matrix";
import { LevelMap } from "./../screen/map/levelMap";
import Engine from "./../screen/physicsEngine";
import { Player } from "../screen/map/player";
import Pawn from "../screen/map/pawn";

const eventListener = EventListener.get();

export class Client {
  deviceId!: number;
  airConsole: any;
  players: Map<ConnectedDevice, Player> = new Map();

  constructor() {
    this.airConsole = new AirConsole();
    this.initMessageHandler();

    this.airConsole.onDeviceStateChange = (id: number, state: any) => {
      try {
        getDevice(id).updateState(state);
      } catch (e) {
        const newDevice = new ConnectedDevice(id);
        newDevice.updateState(state);
      }
    };

    eventListener.on("SERVER_updateState", (state: any) => {
      console.log("game state changed", state.state);

      if (state.state === "join") {
        // prepare stuff for join state
      }

      if (state.state === "choose") {
        // prepare stuff for choose state
        this.airConsole.setCustomDeviceState({
          wantAngry: Math.random() > 0.5
        });
      }

      if (state.state === "game") {
        // prepare stuff for game state
        let myDeviceId = this.airConsole.getDeviceId();
        const level = new LevelMap("../level/level1.json", document.body);
        level.wait.then(() => {
          // Engine.showDebugPlayer();
          Engine.showDebugRenderer(level);
          Engine.start();
          getAllDevices().forEach(device => {
            if (!this.players.has(device)) {
              let player = new Player(
                level,
                vec2.fromValues(-5000, -5000),
                Pawn
              );
              if (device.deviceId === myDeviceId) {
                level.setCameraPosition(player.position);
              }
              this.players.set(device, player);
            }
          });
        });
        eventListener.on(
          "SERVER_updatePlayer",
          (data: {
            [id: number]: {
              position: vec2;
              direction: "up" | "down" | "left" | "right";
            };
          }) => {
            for (let key in data) {
              let device = getDevice(Number.parseInt(key));
              let item = data[key];
              let p = this.players.get(device)!;
              p.pawn.move(item.direction);
              p.pawn.position = item.position;
              if (key === myDeviceId) {
                level.setCameraPosition(p.position);
              }
              this.players.set(device, p);
            }
          }
        );

        const rate = 1000/25
        this.debugInterface = setInterval(() => {
          const direction = vec2.random(vec2.create(), 2);
          this.moveAndInteract(direction[0], direction[1], Math.random() > 0.5);
        }, rate);
        
      } else {
        clearInterval(this.debugInterface);
      }
    });
  }
  debugInterface: any;

  private initMessageHandler() {
    this.airConsole.onMessage = (
      from: number,
      data: AirConsoleMessage<any>
    ) => {
      if (data) {
        if (from === 0) {
          const event = "SERVER_" + data.action;
          eventListener.trigger(event as any, data.data);
        } else {
          // IDK
        }
      }
    };
  }

  changeAppearance(appearance: CharacterAppearanceType) {
    let controllerUpdate: AirConsoleMessage<AirConsoleCharacterAppearanceUpdate> = {
      action: "updateCharacterAppearance",
      data: {
        appearance: appearance
      }
    };
    this.notifyServer(controllerUpdate);
  }

  moveAndInteract(x: number, y: number, isInteracting: boolean = false) {
    let controllerUpdate: AirConsoleMessage<AirConsoleControllerUpdate> = {
      action: "updateControllerData",
      data: {
        doesAction: isInteracting,
        moveDirection: vec2.fromValues(x, y)
      }
    };
    this.notifyServer(controllerUpdate);
  }

  private notifyServer(data: any) {
    this.airConsole.message(AirConsole.SCREEN, data);
  }
}
