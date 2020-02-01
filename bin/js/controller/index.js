(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = "common";
var Server = /** @class */ (function () {
    function Server() {
        this.airConsole = new AirConsole();
        this.playerData = [];
    }
    Server.prototype.sendPlayerData = function () {
        this.sendAllClients(this.playerData);
    };
    Server.prototype.sendAllClients = function (data) {
        this.airConsole.broadcast(data);
    };
    return Server;
}());
exports.Server = Server;
var Client = /** @class */ (function () {
    function Client() {
        this.id = 0;
        this.playerData = [];
        if (!this.id)
            this.id = this.airconsole.getDeviceId();
        this.airconsole = new AirConsole();
        this.subscribeToAirConsole();
        this.getPlayers();
    }
    Client.prototype.getPlayers = function () {
        var _this = this;
        setInterval(function () {
            (_this.playerData = _this.airconsole.getPlayerData()), 300;
        });
    };
    Client.prototype.sendControllerData = function (controllerData) {
        controllerData.id = this.id;
        this.airconsole.message(AirConsole.SCREEN, JSON.stringify(controllerData));
    };
    Client.prototype.recive = function () {
        this.playerData;
    };
    Client.prototype.subscribeToAirConsole = function () {
        this.onMessage();
    };
    Client.prototype.onMessage = function () {
        this.airconsole.onMessage = function (from, data) {
            data.filter();
        };
    };
    return Client;
}());
exports.Client = Client;
var PlayerData = /** @class */ (function () {
    function PlayerData(x, y, deviceId, isReady) {
        this.x = x;
        this.y = y;
        this.type = TransactionType.PlayerData;
        this.playerState = PlayerState.idle;
        this.isAngryDad = false;
        this.isReady = false;
        this.id = 0;
        this.id = deviceId;
        this.isReady = isReady;
    }
    return PlayerData;
}());
exports.PlayerData = PlayerData;
var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["ServerState"] = 0] = "ServerState";
    TransactionType[TransactionType["PlayerData"] = 1] = "PlayerData";
    TransactionType[TransactionType["ControllerData"] = 2] = "ControllerData";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var ServerState;
(function (ServerState) {
    ServerState[ServerState["joining"] = 0] = "joining";
    ServerState[ServerState["running"] = 1] = "running";
    ServerState[ServerState["final"] = 2] = "final";
})(ServerState = exports.ServerState || (exports.ServerState = {}));
var ControllerData = /** @class */ (function () {
    function ControllerData(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
        this.id = 0;
    }
    return ControllerData;
}());
exports.ControllerData = ControllerData;
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["idle"] = 0] = "idle";
    PlayerState[PlayerState["dead"] = 1] = "dead";
    PlayerState[PlayerState["running"] = 2] = "running";
    PlayerState[PlayerState["interacting"] = 3] = "interacting";
})(PlayerState = exports.PlayerState || (exports.PlayerState = {}));



},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../common/index");
var Controller = /** @class */ (function () {
    function Controller() {
        var _this = this;
        this.startPos = undefined;
        document.addEventListener('DOMContentLoaded', function () {
            _this.init();
        });
    }
    Controller.prototype.init = function () {
        var _this = this;
        document.querySelectorAll('controller')[0].addEventListener('touchstart', function (ev) {
            console.log('touchstart');
            _this.startPos = [ev.targetTouches[0].clientX, ev.targetTouches[0].clientY];
        });
        document.querySelectorAll('controller')[0].addEventListener('touchmove', function (ev) {
            if (_this.startPos !== undefined) {
                new index_1.ControllerData(ev.targetTouches[0].clientX - _this.startPos[0], ev.targetTouches[0].clientY - _this.startPos[1]);
            }
        });
        document.querySelectorAll('controller')[0].addEventListener('touchend', function (ev) {
            _this.startPos = undefined;
        });
    };
    return Controller;
}());
new Controller();



},{"../common/index":1}]},{},[2]);

//# sourceMappingURL=index.js.map
