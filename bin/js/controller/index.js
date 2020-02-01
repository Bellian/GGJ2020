(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = "common";
var PlayerData = /** @class */ (function () {
    function PlayerData(x, y, deviceId, isReady) {
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
    ServerState[ServerState["starting"] = 3] = "starting";
    ServerState[ServerState["running"] = 4] = "running";
    ServerState[ServerState["final"] = 5] = "final";
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
    function ServerData(timerValueInSeconds) {
        this.timerValueInSeconds = timerValueInSeconds;
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



},{}],2:[function(require,module,exports){
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
            _this.client.updateServerState(_this.updateView);
        });
    }
    Controller.prototype.showView = function (view) {
        document.querySelectorAll(Views[view])[0].classList.add('visible');
    };
    Controller.prototype.hideView = function (view) {
        document.querySelectorAll(Views[view])[0].classList.remove('visible');
    };
    Controller.prototype.updateView = function (serverState) {
        switch (serverState) {
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



},{"../common/index":1}]},{},[2]);

//# sourceMappingURL=index.js.map
