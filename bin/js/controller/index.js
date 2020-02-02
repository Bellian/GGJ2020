(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var Client = /** @class */ (function () {
    function Client() {
        var _this = this;
        this.id = 0;
        this.playerData = [];
        this.objectData = [];
        this.updateServerCallbacks = new Set();
        this.serverData = new index_1.ServerData(30, index_1.ServerState.initial);
        this.airConsole = new AirConsole();
        this.airConsole.onDeviceStateChange = function (id) {
            _this.id = id;
            _this.subscribeToAirConsole();
        };
    }
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
        this.airConsole.onMessage = function (from, dataAsString) {
            if (dataAsString) {
                var data = JSON.parse(dataAsString);
                switch (data.transactionType) {
                    case index_1.TransactionType.PlayerData:
                        console.log("received player data", data);
                        _this.playerData = data.playerData;
                        break;
                    case index_1.TransactionType.ObjectData:
                        console.log("received object data", data);
                        _this.objectData = data.objectData;
                        break;
                    case index_1.TransactionType.ServerData:
                        console.log("received server data", data);
                        _this.serverData = data.serverData;
                        _this.updateServerData();
                        break;
                    default:
                        console.error("client onMessage switch", dataAsString);
                        break;
                }
            }
            else {
                console.error("client onMessage", dataAsString);
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
        this.airConsole.message(AirConsole.SCREEN, JSON.stringify(data));
    };
    Client.prototype.getTime = function () {
        return this.serverData.timerValueInSeconds;
    };
    return Client;
}());
exports.Client = Client;



},{"./index":2}],2:[function(require,module,exports){
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



},{"./client":1,"./server":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
exports.OBJECTDATAMAXHEALTH = 10;
var Server = /** @class */ (function () {
    function Server() {
        this.playerData = [];
        this.objectData = [];
        this.updateServerCallbacks = new Set();
        this.updateControllerCallbacks = new Set();
        this.airConsole = new AirConsole();
        this.serverData = new index_1.ServerData(30, index_1.ServerState.initial);
        this.subscribeToAirConsole();
    }
    Server.prototype.onUpdateServerState = function (cb) {
        this.updateControllerCallbacks.add(cb);
    };
    Server.prototype.updateServerState = function () {
        var _this = this;
        this.updateServerCallbacks.forEach(function (e) { return e(_this.serverData.serverState); });
    };
    Server.prototype.onUpdateControllerData = function (cb) {
        this.updateControllerCallbacks.add(cb);
    };
    Server.prototype.updateControllerData = function (controllerData) {
        this.updateControllerCallbacks.forEach(function (e) { return e(controllerData); });
    };
    Server.prototype.createAndUpdatePlayer = function (data) {
        var playerFound = this.playerData.find(function (pD) { return pD.id === data.id; });
        if (!playerFound) {
            playerFound = new index_1.PlayerData(0, 0, data.id);
            this.playerData.push(playerFound);
            // this.sendPlayerData();
            this.startAfterFirstPlayerJoined();
        }
        else {
            this.updatePlayer(data);
        }
    };
    Server.prototype.startAfterFirstPlayerJoined = function () {
        var _this = this;
        if (this.playerData.length == 1) {
            this.serverData.serverState = index_1.ServerState.lobby;
            this.updateServerState();
            this.serverStateUpdate(30, index_1.ServerState.characterSelection, function () {
                console.log("changed server state to character selection");
                _this.serverStateUpdate(15, index_1.ServerState.running, function () {
                    _this.serverStateUpdate(300, index_1.ServerState.final, function () { });
                });
            });
        }
    };
    Server.prototype.serverStateUpdate = function (timerValueInSeconds, serverState, cb) {
        var _this = this;
        var timer = this.setAndStartTimer(timerValueInSeconds);
        setTimeout(function () {
            clearInterval(timer);
            _this.serverData.serverState = serverState;
            _this.updateServerState();
            // this.sendServerData();
            if (_this.serverData.serverState === index_1.ServerState.running) {
                _this.setAngryDad();
            }
            cb();
        }, timerValueInSeconds * 1000);
    };
    Server.prototype.setAngryDad = function () {
        var wantAngryDads = this.playerData.filter(function (pD) {
            pD.isAngryDad;
        });
        var countAngryDads = wantAngryDads.length;
        console.log("wantAngryDads", wantAngryDads);
        console.log("countAngryDads", countAngryDads);
        console.table("playerData", this.playerData);
        if (countAngryDads === 0) {
            var angryDadIndex = Math.floor(Math.random() * this.playerData.length);
            this.playerData.map(function (pD) { return (pD.isAngryDad = false); });
            this.playerData[angryDadIndex].isAngryDad = true;
        }
        if (countAngryDads > 1) {
            var angryDadPlayerId_1 = wantAngryDads[Math.floor(Math.random() * countAngryDads)].id;
            this.playerData.map(function (pD) { return (pD.isAngryDad = false); });
            this.playerData.filter(function (pD) { return pD.id === angryDadPlayerId_1; })[0].isAngryDad = true;
        }
        // this.sendPlayerData();
    };
    Server.prototype.setAndStartTimer = function (timerValueInSeconds) {
        var _this = this;
        this.serverData.timerValueInSeconds = timerValueInSeconds;
        return setInterval(function () {
            if (_this.serverData.timerValueInSeconds) {
                _this.serverData.timerValueInSeconds--;
                // this.sendServerData();
            }
        }, 1000);
    };
    Server.prototype.updatePlayer = function (updateData) {
        var player = this.playerData.find(function (pD) { return pD.id === updateData.id; });
        if (player) {
            var playerIndex = this.playerData.indexOf(player);
            this.playerData[playerIndex] = updateData;
            if (updateData.playerState === index_1.PlayerState.interacting) {
                //JS find Item and damage/heal
                var itemFound = { damage: 0, x: 0, y: 0, objectId: 0 };
                if (itemFound) {
                    itemFound.damage += updateData.isAngryDad ? -1 : 1;
                    if (itemFound.damage > exports.OBJECTDATAMAXHEALTH)
                        itemFound.damage = exports.OBJECTDATAMAXHEALTH;
                    if (itemFound.damage < 0)
                        itemFound.damage = 0;
                }
                if (updateData.isAngryDad) {
                    //check for wichtel
                }
            }
            // this.sendPlayerData();
        }
    };
    Server.prototype.sendAllClients = function (data) {
        this.airConsole.broadcast(JSON.stringify(data));
    };
    Server.prototype.onMessage = function () {
        var _this = this;
        this.airConsole.onMessage = function (from, dataAsString) {
            if (dataAsString) {
                var data = JSON.parse(dataAsString);
                switch (data.transactionType) {
                    case index_1.TransactionType.PlayerData:
                        _this.createAndUpdatePlayer(data);
                        break;
                    case index_1.TransactionType.ControllerData:
                        _this.updateControllerData(data);
                        //JS after change   this.updatePlayer()
                        break;
                    default:
                        console.error("server onMessage", dataAsString);
                        break;
                }
            }
        };
    };
    Server.prototype.subscribeToAirConsole = function () {
        var _this = this;
        this.onMessage();
        this.airConsole.onConnect = function (id) {
            _this.createAndUpdatePlayer({ id: id });
            if (!_this.sendPlayerToClient) {
                _this.sendPlayerToClient = setInterval(function () {
                    _this.sendPlayerData();
                    _this.sendServerData();
                    _this.sendObjectData();
                }, 500);
            }
        };
        this.airConsole.onDisconnect = function (id) {
            _this.playerData.splice(_this.playerData.indexOf(_this.playerData.filter(function (pD) { return pD.id === id; })[0]), 1);
            // this.sendPlayerData();
        };
    };
    Server.prototype.sendPlayerData = function () {
        // console.table(this.playerData);
        this.sendAllClients({
            transactionType: index_1.TransactionType.PlayerData,
            playerData: this.playerData
        });
    };
    Server.prototype.sendObjectData = function () {
        this.sendAllClients({
            transactionType: index_1.TransactionType.ObjectData,
            objectData: this.objectData
        });
    };
    Server.prototype.sendServerData = function () {
        this.sendAllClients({
            transactionType: index_1.TransactionType.ServerData,
            serverData: this.serverData
        });
    };
    return Server;
}());
exports.Server = Server;



},{"./index":2}],4:[function(require,module,exports){
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



},{"../common/index":2}]},{},[4]);

//# sourceMappingURL=index.js.map
