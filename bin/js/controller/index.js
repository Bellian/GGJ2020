(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var Client = /** @class */ (function () {
    function Client() {
        this.id = 0;
        this.playerData = [];
        this.objectData = [];
        this.serverData = new index_1.ServerData();
        this.updateServerCallbacks = new Set();
        if (!this.id)
            this.id = this.airconsole.getDeviceId();
        this.airconsole = new AirConsole();
        this.subscribeToAirConsole();
    }
    Client.prototype.onUpdateServerData = function (cb) {
        this.updateServerCallbacks.add(cb);
    };
    ;
    Client.prototype.updateServerData = function () {
        var _this = this;
        this.updateServerCallbacks.forEach(function (e) { return e(_this.serverData); });
    };
    Client.prototype.currentPlayerData = function () {
        var _this = this;
        return this.playerData.filter(function (pD) { return pD.id === _this.id; })[0];
    };
    Client.prototype.sendControllerData = function (controllerData) {
        controllerData.id = this.id;
        this.notifyServer(controllerData);
    };
    Client.prototype.subscribeToAirConsole = function () {
        var _this = this;
        this.airconsole.onMessage = function (from, data) {
            switch (data.transactionType) {
                case index_1.TransactionType.PlayerData:
                    _this.playerData = data.playerData;
                    break;
                case index_1.TransactionType.ObjectData:
                    _this.objectData = data.objectData;
                    break;
                case index_1.TransactionType.ServerData:
                    _this.serverData = data.serverData;
                    _this.updateServerData();
                    break;
                default:
                    console.error("not implemented", data);
                    break;
            }
        };
    };
    Client.prototype.toggleAngryDad = function () {
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
    Client.prototype.notifyServer = function (data) {
        this.airconsole.message(AirConsole.SCREEN, JSON.stringify(data));
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
        this.transactionType = TransactionType.PlayerData;
        this.playerState = PlayerState.idle;
        this.characterAppearanceType = CharacterAppearanceType.wichtel1;
        this.isAngryDad = undefined;
        this.id = 0;
        this.id = deviceId;
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
        this.transactionType = TransactionType.ControllerData;
        this.id = 0;
    }
    return ControllerData;
}());
exports.ControllerData = ControllerData;
var ServerData = /** @class */ (function () {
    function ServerData(timerValueInSeconds, serverState) {
        if (timerValueInSeconds === void 0) { timerValueInSeconds = 30; }
        if (serverState === void 0) { serverState = ServerState.initial; }
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
    function ObjectData(x, y, id) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
        this.id = id;
    }
    return ObjectData;
}());
exports.ObjectData = ObjectData;



},{"./client":1,"./server":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var Server = /** @class */ (function () {
    function Server() {
        var _this = this;
        this.airConsole = new AirConsole();
        this.serverData = new index_1.ServerData();
        this.playerData = [];
        this.objectData = [];
        this.updateServerState = function () { return function (cb) {
            cb(_this.serverData.serverState);
        }; };
        this.updateControllerData = function (controllerData) { return function (cb) {
            cb(controllerData);
        }; };
        this.subscribeToAirConsole();
    }
    Server.prototype.createAndUpdatePlayer = function (data) {
        var playerFound = this.playerData.find(function (pD) { return pD.id === data.id; });
        if (!playerFound) {
            playerFound = new index_1.PlayerData(0, 0, data.id);
            this.playerData.push(playerFound);
            this.startAfterFirstPlayerJoined();
        }
        this.updatePlayer(data);
    };
    Server.prototype.startAfterFirstPlayerJoined = function () {
        var _this = this;
        if (this.playerData.length == 1) {
            this.serverData.serverState = index_1.ServerState.lobby;
            this.updateServerState();
            this.serverStateUpdate(30, index_1.ServerState.characterSelection, function () {
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
            _this.serverData.serverState = serverState;
            _this.updateServerState();
            cb();
            clearInterval(timer);
        }, timerValueInSeconds);
    };
    Server.prototype.setAndStartTimer = function (timerValueInSeconds) {
        var _this = this;
        this.serverData.timerValueInSeconds = timerValueInSeconds;
        return setInterval(function () {
            if (_this.serverData.timerValueInSeconds)
                _this.serverData.timerValueInSeconds--;
            _this.sendServerData();
        }, 1000);
    };
    Server.prototype.updatePlayer = function (updateData) {
        var player = this.playerData.filter(function (pD) { return pD.id === updateData.id; })[0];
        player = player;
        this.sendPlayerData();
    };
    Server.prototype.sendAllClients = function (data) {
        this.airConsole.broadcast(data);
    };
    Server.prototype.onMessage = function () {
        var _this = this;
        this.airConsole.onMessage = function (from, data) {
            switch (data.transactionType) {
                case index_1.TransactionType.PlayerData:
                    _this.createAndUpdatePlayer(data);
                    break;
                case index_1.TransactionType.ControllerData:
                    _this.updateControllerData(data);
                    //JS after change   this.updatePlayer()
                    break;
                default:
                    console.error("not implemented", data);
                    break;
            }
            _this.sendPlayerData();
        };
    };
    Server.prototype.subscribeToAirConsole = function () {
        var _this = this;
        this.airConsole.onConnect = function (id) {
            _this.createAndUpdatePlayer({ id: id });
            _this.sendObjectData();
            _this.sendServerData();
        };
    };
    Server.prototype.sendPlayerData = function () {
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
    Views[Views["endscreen"] = 3] = "endscreen";
})(Views || (Views = {}));
var Controller = /** @class */ (function () {
    function Controller(client) {
        var _this = this;
        this.client = client;
        this.startPos = undefined;
        document.addEventListener('DOMContentLoaded', function () {
            _this.virtualController();
            _this.client.onUpdateServerData(_this.updateView.bind(_this));
        });
    }
    Controller.prototype.showView = function (view) {
        document.querySelectorAll(Views[view])[0].classList.add('visible');
    };
    Controller.prototype.hideView = function (view) {
        document.querySelectorAll(Views[view])[0].classList.remove('visible');
    };
    Controller.prototype.updateView = function (serverData) {
        switch (serverData.serverState) {
            case index_1.ServerState.lobby:
                this.showView(Views.splashscreen);
                break;
            case index_1.ServerState.characterSelection:
                this.showView(Views.characterselection);
                break;
            case index_1.ServerState.running:
                this.showView(Views.playscreen);
                break;
            case index_1.ServerState.final:
                this.showView(Views.endscreen);
                break;
            default:
                console.error('not implemented', serverState);
        }
    };
    Controller.prototype.virtualController = function () {
        var _this = this;
        document.querySelectorAll('controller')[0].addEventListener('touchstart', function (ev) {
            console.log('touchstart');
            _this.startPos = [ev.targetTouches[0].clientX, ev.targetTouches[0].clientY];
        });
        document.querySelectorAll('controller')[0].addEventListener('touchmove', function (ev) {
            if (_this.startPos !== undefined) {
                _this.client.sendControllerData(new index_1.ControllerData(ev.targetTouches[0].clientX - _this.startPos[0], ev.targetTouches[0].clientY - _this.startPos[1]));
            }
        });
        document.querySelectorAll('controller')[0].addEventListener('touchend', function (ev) {
            _this.startPos = undefined;
        });
    };
    Controller.prototype.splashscreen = function () {
        var _this = this;
        document.querySelectorAll('splashscreen > button').forEach(function (btn) {
            var character = document.querySelectorAll('splashscreen > character')[0];
            var isPlayerAngryDad = _this.client.toggleAngryDad();
            if (isPlayerAngryDad) {
                character.innerHTML = 'You would like to be angry dad!';
            }
            else {
                character.innerHTML = 'You would like to be a wichtel!';
            }
        });
        var timeUntilStartInterval = setInterval(function () {
            var timeUntilStart = _this.client.getTime();
            document.querySelectorAll('splashscreen > time')[0].innerHTML = timeUntilStart;
            if (timeUntilStart === 0) {
                clearInterval(timeUntilStartInterval);
            }
        }, 1000);
    };
    return Controller;
}());
var client = new index_1.Client();
new Controller(client);



},{"../common/index":2}]},{},[4]);

//# sourceMappingURL=index.js.map
