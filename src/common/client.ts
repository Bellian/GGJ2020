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
        try {
          getDevice(this.airConsole.getDeviceId());
        } catch (e) {
          const newDevice = new ConnectedDevice(this.airConsole.getDeviceId());
        }
      }

      if (state.state === "game") {
        // prepare stuff for game state
        let myDeviceId = this.airConsole.getDeviceId();
        Engine.init();
        const container =
          document.querySelector("gamecontainer") ||
          document.querySelector("playscreen") ||
          document.body;
        const level = new LevelMap(
          "../level/level1.json",
          container as HTMLElement
        );
        level.wait.then(() => {
          // Engine.showDebugPlayer();
          // Engine.showDebugRenderer(level);
          Engine.start();
          getAllDevices().forEach(device => {
            if (device.deviceId === 0) {
              return;
            }
            if (!this.players.has(device)) {
              console.log("create player for:", device.deviceId);
              let player = new Player(
                level,
                vec2.fromValues(-5000, -5000),
                Pawn,
                device.customStateData.isAngryDad
              );
              player.pawn.viewUpdate();
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
              let player = this.players.get(device);
              if (player === undefined || player === null) {
                return;
              }
              player.pawn.move(item.direction);
              vec2.copy(player.position, item.position);
              vec2.copy(player.pawn.position, item.position);

              if (Number.parseInt(key) === myDeviceId) {
                level.setCameraPosition(player.position);
              }
              player.pawn.viewUpdate();
            }
          }
        );
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

  moveTimeout: any;
  lastData: any;
  moveAndInteract(
    x: number = 0,
    y: number = 0,
    isInteracting: boolean = false,
    isTouching = false
  ) {
    this.lastData = {
      doesAction: isInteracting,
      moveDirection: vec2.fromValues(x, y),
      isTouching: isTouching
    };
    if (this.moveTimeout) {
      return;
    }
    this.moveTimeout = setTimeout(() => {
      this.moveTimeout = undefined;
      let controllerUpdate: AirConsoleMessage<AirConsoleControllerUpdate> = {
        action: "updateControllerData",
        data: this.lastData
      };
      this.notifyServer(controllerUpdate);
    }, 1000 / 25);
  }

  private notifyServer(data: any) {
    this.airConsole.message(AirConsole.SCREEN, data);
  }
}
