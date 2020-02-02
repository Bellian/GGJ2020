(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var eventListener_1 = require("./eventListener");
var connectedDevice_1 = require("./connectedDevice");
var eventListener = eventListener_1.EventListener.get();
var Client = /** @class */ (function () {
    function Client() {
        var _this = this;
        this.id = 0;
        this.playerData = [];
        this.objectData = [];
        this.updateServerCallbacks = new Set();
        this.serverData = new index_1.ServerData(30, index_1.ServerState.initial);
        this.awaitReady = new Promise(function (resolve) {
            _this.airConsole = new AirConsole();
            _this.initMessageHandler();
            _this.airConsole.onDeviceStateChange = function (id, state) {
                try {
                    connectedDevice_1.getDevice(id).updateState(state);
                }
                catch (e) {
                    var newDevice = new connectedDevice_1.ConnectedDevice(id);
                    newDevice.updateState(state);
                }
            };
            eventListener.on('SERVER_updateState', function (state) {
                console.log('game state changed', state.state);
                if (state.state === 'join') {
                    // prepare stuff for join state
                }
                if (state.state === 'choose') {
                    // prepare stuff for choose state
                    _this.airConsole.setCustomDeviceState({
                        wantAngry: Math.random() > 0.5,
                    });
                }
                if (state.state === 'game') {
                    // prepare stuff for game state
                }
            });
        });
    }
    Client.prototype.initMessageHandler = function () {
        this.airConsole.onMessage = function (from, data) {
            if (data) {
                if (from === 0) {
                    var event_1 = 'SERVER_' + data.action;
                    eventListener.trigger(event_1, data.data);
                }
                else {
                    // IDK
                }
            }
        };
    };
    Client.prototype.onUpdateServerData = function (cb) {
        this.updateServerCallbacks.add(cb);
    };
    Client.prototype.updateServerData = function () {
        var _this = this;
        this.updateServerCallbacks.forEach(function (e) { return e(_this.serverData); });
    };
    Client.prototype.currentPlayerData = function () {
        var _this = this;
        console.table("currentPlayerData playerData", this.playerData);
        console.table("currentPlayerData id", this.id);
        return this.playerData.filter(function (pD) { return pD.id === _this.id; })[0];
    };
    Client.prototype.sendControllerData = function (controllerData) {
        controllerData.id = this.id;
        this.notifyServer(controllerData);
    };
    Client.prototype.subscribeToAirConsole = function () {
        var _this = this;
        this.airConsole.onMessage = function (from, data) {
            if (data) {
                switch (data.transactionType) {
                    case index_1.TransactionType.PlayerData:
                        console.log("received player data", data);
                        _this.playerData = data.playerData;
                        break;
                    case index_1.TransactionType.ObjectData:
                        // console.log("received object data", data);
                        _this.objectData = data.objectData;
                        break;
                    case index_1.TransactionType.ServerData:
                        // console.log("received server data", data);
                        _this.serverData = data.serverData;
                        _this.updateServerData();
                        break;
                    default:
                        console.error("client onMessage switch", data);
                        break;
                }
            }
            else {
                console.error("client onMessage", data);
            }
        };
    };
    Client.prototype.toggleAngryDad = function () {
        console.table("toggleAngryDad playerData", this.playerData);
        console.table("toggleAngryDad id", this.id);
        var currentPlayer = this.currentPlayerData();
        if (currentPlayer.isAngryDad === undefined) {
            currentPlayer.isAngryDad = false;
        }
        else {
            currentPlayer.isAngryDad = !currentPlayer.isAngryDad;
        }
        this.notifyServer(currentPlayer);
        return currentPlayer.isAngryDad;
    };
    Client.prototype.changeAppearance = function (appearance) {
        var currentPlayer = this.currentPlayerData();
        currentPlayer.characterAppearanceType = appearance;
        this.notifyServer(currentPlayer);
        return currentPlayer.characterAppearanceType;
    };
    Client.prototype.interacting = function (playerState) {
        var currentPlayer = this.currentPlayerData();
        currentPlayer.playerState = playerState;
        this.notifyServer(currentPlayer);
        return currentPlayer.playerState;
    };
    Client.prototype.notifyServer = function (data) {
        this.airConsole.message(AirConsole.SCREEN, data);
    };
    Client.prototype.getTime = function () {
        return this.serverData.timerValueInSeconds;
    };
    return Client;
}());
exports.Client = Client;



},{"./connectedDevice":2,"./eventListener":3,"./index":4}],2:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventListener_1 = require("./eventListener");
var eventListener = eventListener_1.EventListener.get();
var deviceLib = new Map();
function getDevice(deviceId) {
    if (!deviceLib.has(deviceId)) {
        throw new Error('The device does not exist: ' + deviceId);
    }
    return deviceLib.get(deviceId);
}
exports.getDevice = getDevice;
function getAllDevices() {
    return __spread(deviceLib.values());
}
exports.getAllDevices = getAllDevices;
var internalID = 0;
var ConnectedDevice = /** @class */ (function () {
    function ConnectedDevice(deviceId) {
        this.deviceId = deviceId;
        this.internalID = internalID++;
        deviceLib.set(deviceId, this);
        eventListener.trigger('deviceJoined', this);
    }
    ConnectedDevice.prototype.disconnect = function () {
        deviceLib.delete(this.deviceId);
        eventListener.trigger('deviceDisconnected', this);
    };
    ConnectedDevice.prototype.updateState = function (data) {
        this.stateData = data;
    };
    ConnectedDevice.prototype.updateCustomState = function (data) {
        this.customStateData = data;
    };
    ConnectedDevice.prototype.toJson = function () {
        return {
            internalID: this.internalID,
            deviceId: this.deviceId,
        };
    };
    return ConnectedDevice;
}());
exports.ConnectedDevice = ConnectedDevice;



},{"./eventListener":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventListener = /** @class */ (function () {
    function EventListener() {
        this.listener = {};
    }
    EventListener.get = function () {
        if (this.instance === undefined) {
            this.instance = new EventListener();
        }
        return this.instance;
    };
    EventListener.prototype.on = function (event, callback) {
        if (this.listener[event] === undefined) {
            this.listener[event] = [];
        }
        this.listener[event].push(callback);
        return callback;
    };
    EventListener.prototype.off = function (event, callback) {
        if (this.listener[event] !== undefined) {
            var index = this.listener[event].indexOf(callback);
            if (index !== -1) {
                this.listener[event].splice(index, 1);
            }
        }
        return callback;
    };
    EventListener.prototype.trigger = function (event, data) {
        if (this.listener[event] !== undefined) {
            this.listener[event].forEach(function (e) { return e(data); });
        }
    };
    return EventListener;
}());
exports.EventListener = EventListener;



},{}],4:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./client"));
__export(require("./server"));
var PlayerData = /** @class */ (function () {
    function PlayerData(x, y, deviceId) {
        this.x = x;
        this.y = y;
        this.id = deviceId;
        this.transactionType = TransactionType.PlayerData;
        this.playerState = PlayerState.idle;
        this.isAngryDad = false;
        this.characterAppearanceType = CharacterAppearanceType.wichtel1;
    }
    return PlayerData;
}());
exports.PlayerData = PlayerData;
var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["ServerData"] = 0] = "ServerData";
    TransactionType[TransactionType["PlayerData"] = 1] = "PlayerData";
    TransactionType[TransactionType["ControllerData"] = 2] = "ControllerData";
    TransactionType[TransactionType["ObjectData"] = 3] = "ObjectData";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var ServerState;
(function (ServerState) {
    ServerState[ServerState["initial"] = 0] = "initial";
    ServerState[ServerState["lobby"] = 1] = "lobby";
    ServerState[ServerState["characterSelection"] = 2] = "characterSelection";
    ServerState[ServerState["running"] = 3] = "running";
    ServerState[ServerState["final"] = 4] = "final";
})(ServerState = exports.ServerState || (exports.ServerState = {}));
var ControllerData = /** @class */ (function () {
    function ControllerData(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
        this.id = 0;
        this.transactionType = TransactionType.ControllerData;
    }
    return ControllerData;
}());
exports.ControllerData = ControllerData;
var ServerData = /** @class */ (function () {
    function ServerData(timerValueInSeconds, serverState) {
        if (timerValueInSeconds === void 0) { timerValueInSeconds = 30; }
        this.timerValueInSeconds = timerValueInSeconds;
        this.serverState = serverState;
    }
    return ServerData;
}());
exports.ServerData = ServerData;
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["idle"] = 0] = "idle";
    PlayerState[PlayerState["dead"] = 1] = "dead";
    PlayerState[PlayerState["running"] = 2] = "running";
    PlayerState[PlayerState["interacting"] = 3] = "interacting";
})(PlayerState = exports.PlayerState || (exports.PlayerState = {}));
var CharacterAppearanceType;
(function (CharacterAppearanceType) {
    CharacterAppearanceType[CharacterAppearanceType["wichtel1"] = 0] = "wichtel1";
    CharacterAppearanceType[CharacterAppearanceType["wichtel2"] = 1] = "wichtel2";
    CharacterAppearanceType[CharacterAppearanceType["wichtel3"] = 2] = "wichtel3";
    CharacterAppearanceType[CharacterAppearanceType["wichtel4"] = 3] = "wichtel4";
})(CharacterAppearanceType = exports.CharacterAppearanceType || (exports.CharacterAppearanceType = {}));
var ObjectData = /** @class */ (function () {
    function ObjectData(x, y, damage, objectId) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (damage === void 0) { damage = 0; }
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.objectId = objectId;
    }
    return ObjectData;
}());
exports.ObjectData = ObjectData;



},{"./client":1,"./server":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var connectedDevice_1 = require("./connectedDevice");
var eventListener_1 = require("./eventListener");
var gameStateJoin_1 = require("./server/gameStateJoin");
var eventListener = eventListener_1.EventListener.get();
exports.OBJECTDATAMAXHEALTH = 10;
var Server = /** @class */ (function () {
    function Server() {
        var _this = this;
        this.playerData = [];
        this.objectData = [];
        this.airConsole = new AirConsole();
        this.serverData = new index_1.ServerData(30, index_1.ServerState.initial);
        this.subscribeToAirConsole();
        this.gameState = new gameStateJoin_1.GameStateJoin(this, 3000);
        eventListener.on('newGameState', function (state) {
            _this.gameState = state;
        });
        this.initTick();
        this.initMessageHandler();
    }
    Server.prototype.initTick = function () {
        var _this = this;
        var time = performance.now();
        setInterval(function () {
            var newTime = performance.now();
            var delta = newTime - time;
            time = newTime;
            _this.gameState.tick(delta);
        }, 1000 / 60);
    };
    Server.prototype.initMessageHandler = function () {
        this.airConsole.onMessage = function (from, data) {
            if (data) {
                if (from === 0) {
                    var event_1 = 'CLIENT_' + data.action;
                    data.data.from = from;
                    eventListener.trigger(event_1, data.data);
                }
                else {
                    // IDK
                }
            }
        };
    };
    Server.prototype.subscribeToAirConsole = function () {
        this.airConsole.onConnect = function (id) {
        };
        this.airConsole.onDisconnect = function (id) {
            connectedDevice_1.getDevice(id).disconnect();
        };
        this.airConsole.onDeviceStateChange = function (id, data) {
            try {
                connectedDevice_1.getDevice(id).updateState(data);
            }
            catch (e) {
                var newDevice = new connectedDevice_1.ConnectedDevice(id);
                newDevice.updateState(data);
            }
        };
        this.airConsole.onCustomDeviceStateChange = function (id, data) {
            try {
                connectedDevice_1.getDevice(id).updateCustomState(data);
            }
            catch (e) {
                var newDevice = new connectedDevice_1.ConnectedDevice(id);
                newDevice.updateCustomState(data);
            }
        };
    };
    return Server;
}());
exports.Server = Server;



},{"./connectedDevice":2,"./eventListener":3,"./index":4,"./server/gameStateJoin":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventListener_1 = require("../eventListener");
var eventListener = eventListener_1.EventListener.get();
var GameState = /** @class */ (function () {
    function GameState(server) {
        this.server = server;
        this.enter();
    }
    GameState.prototype.tick = function (delta) {
    };
    GameState.prototype.enter = function () {
    };
    ;
    GameState.prototype.exit = function () {
        var newState = new this.nextState(this.server);
        eventListener.trigger('newGameState', newState);
    };
    GameState.prototype.onExit = function (cb) {
        this.callback = cb;
    };
    return GameState;
}());
exports.GameState = GameState;



},{"../eventListener":3}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var gameState_1 = require("./gameState");
var eventListener_1 = require("../eventListener");
var connectedDevice_1 = require("../connectedDevice");
var eventListener = eventListener_1.EventListener.get();
var duration = 3000;
var GameStateChoose = /** @class */ (function (_super) {
    __extends(GameStateChoose, _super);
    function GameStateChoose(server) {
        var _this = _super.call(this, server) || this;
        //nextState = undefined;
        _this.duration = duration;
        _this.nextState = gameState_1.GameState;
        return _this;
    }
    GameStateChoose.prototype.enter = function () {
        this.startTimer();
        this.server.airConsole.broadcast({
            action: 'updateState',
            data: {
                state: 'choose',
                timerStarted: this.timerStarted,
                duration: duration,
            }
        });
    };
    GameStateChoose.prototype.tick = function (delta) {
        if (this.timerStarted === undefined) {
            return;
        }
        var timeLeft = this.duration - (Date.now() - this.timerStarted);
        if (timeLeft <= 0) {
            console.log('timer is up, next state');
            this.exit();
        }
    };
    GameStateChoose.prototype.exit = function () {
        var angry = undefined;
        var devices = connectedDevice_1.getAllDevices();
        var candidates = devices.filter(function (e) { return e.customStateData.wantAngry; });
        if (candidates.length === 0) {
            // fuck u all and pick random
            angry = devices[Math.floor(devices.length * Math.random())];
        }
        else {
            angry = candidates[Math.floor(candidates.length * Math.random())];
        }
        console.log('and the winner is:', angry, devices, candidates);
        connectedDevice_1.getAllDevices().forEach(function (e) {
            console.log(e.customStateData);
        });
        _super.prototype.exit.call(this);
    };
    GameStateChoose.prototype.startTimer = function () {
        console.log('player joined, starting timer');
        this.timerStarted = Date.now();
    };
    return GameStateChoose;
}(gameState_1.GameState));
exports.GameStateChoose = GameStateChoose;



},{"../connectedDevice":2,"../eventListener":3,"./gameState":6}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var gameState_1 = require("./gameState");
var eventListener_1 = require("../eventListener");
var gameStateChoose_1 = require("./gameStateChoose");
var eventListener = eventListener_1.EventListener.get();
var GameStateJoin = /** @class */ (function (_super) {
    __extends(GameStateJoin, _super);
    function GameStateJoin(server, duration) {
        var _this = _super.call(this, server) || this;
        _this.duration = duration;
        //nextState = undefined;
        _this.nextState = gameStateChoose_1.GameStateChoose;
        return _this;
    }
    GameStateJoin.prototype.tick = function (delta) {
        if (this.timerStarted === undefined) {
            return;
        }
        var timeLeft = this.duration - (Date.now() - this.timerStarted);
        if (timeLeft <= 0) {
            console.log('timer is up, next state');
            this.exit();
        }
    };
    GameStateJoin.prototype.enter = function () {
        var _this = this;
        this.deviceJoinedCallback = eventListener.on('deviceJoined', function (device) {
            if (!_this.timerStarted) {
                _this.startTimer();
            }
            _this.server.airConsole.message(device.deviceId, {
                action: 'updateState',
                data: {
                    state: 'join',
                    timerStarted: _this.timerStarted,
                    duration: _this.duration,
                }
            });
        });
    };
    GameStateJoin.prototype.exit = function () {
        eventListener.off('deviceJoined', this.deviceJoinedCallback);
        this.server.airConsole.setActivePlayers(4);
        _super.prototype.exit.call(this);
    };
    GameStateJoin.prototype.startTimer = function () {
        console.log('player joined, starting timer');
        this.timerStarted = Date.now();
    };
    return GameStateJoin;
}(gameState_1.GameState));
exports.GameStateJoin = GameStateJoin;



},{"../eventListener":3,"./gameState":6,"./gameStateChoose":7}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../common/index");
var Views;
(function (Views) {
    Views[Views["splashscreen"] = 0] = "splashscreen";
    Views[Views["characterselection"] = 1] = "characterselection";
    Views[Views["playscreen"] = 2] = "playscreen";
})(Views = exports.Views || (exports.Views = {}));
var Controller = /** @class */ (function () {
    function Controller(client) {
        this.client = client;
        this.startPos = undefined;
        // Joystick event handling
        this.joystickMoveCallbacks = new Set();
        this.client.onUpdateServerData(this.updateView.bind(this));
    }
    Controller.prototype.onJoystickMove = function (cb) {
        this.joystickMoveCallbacks.add(cb);
    };
    Controller.prototype.updateJoystickPosition = function (joystickPosition) {
        this.joystickMoveCallbacks.forEach(function (e) { return e(joystickPosition); });
    };
    // displays the current used view
    Controller.prototype.showView = function (view) {
        document.querySelectorAll(Views[view])[0].classList.add("visible");
        document.querySelectorAll('.view').forEach(function (view) { return view.classList.remove("visible"); });
    };
    // initialize the desired view
    Controller.prototype.updateView = function (view) {
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
    };
    // start the virtual controller
    Controller.prototype.virtualController = function () {
        var _this = this;
        document
            .querySelectorAll("playscreen > controller")[0]
            .addEventListener("touchstart", function (ev) {
            _this.startPos = [
                ev.targetTouches[0].clientX,
                ev.targetTouches[0].clientY
            ];
        });
        document
            .querySelectorAll("playscreen > controller")[0]
            .addEventListener("touchmove", function (ev) {
            if (_this.startPos !== undefined) {
                _this.updateJoystickPosition({ x: (ev.targetTouches[0].clientX - _this.startPos[0]), y: -(ev.targetTouches[0].clientY - _this.startPos[1]) });
            }
        });
        document
            .querySelectorAll("playscreen > controller")[0]
            .addEventListener("touchend", function (ev) {
            _this.startPos = undefined;
        });
    };
    // start the time for the lobby
    Controller.prototype.lobby = function () {
        this.setTime(Views.splashscreen, 30);
    };
    // 
    Controller.prototype.characterselection = function () {
        document.querySelectorAll('characterselection > characters > img').forEach(function (character) { return character.addEventListener('click', function () {
            if (character.classList.contains('angry-dad')) {
                document.querySelectorAll('characterselection')[0].classList.add('isAngryDad');
                console.log("You would like to be angry dad!");
            }
            else {
                document.querySelectorAll('characterselection')[0].classList.remove('isAngryDad');
                console.log("You would like to be a wichtel!");
            }
        }); });
        this.setTime(Views.characterselection, 15);
    };
    Controller.prototype.setTime = function (view, timeUntil) {
        var timeUntilInterval = setInterval(function () {
            document.querySelectorAll(Views[view] + " time")[0].innerHTML = timeUntil.toString();
            timeUntil--;
            if (timeUntil <= 0) {
                clearInterval(timeUntilInterval);
            }
        }, 1000);
    };
    return Controller;
}());
document.addEventListener("DOMContentLoaded", function () {
    var client = new index_1.Client();
    var controller = new Controller(client);
    controller.virtualController();
    controller.onJoystickMove(function (pos) {
        console.log(pos);
    });
    //let test = new ServerData(30, ServerState.lobby);
    //controller.updateView(test);
});



},{"../common/index":4}]},{},[9]);

//# sourceMappingURL=index.js.map
