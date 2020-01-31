(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
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
            _this.startPos = [ev.targetTouches[0].clientX, ev.targetTouches[0].clientY];
        });
        document.querySelectorAll('controller')[0].addEventListener('touchmove', function (ev) {
            if (_this.startPos !== undefined) {
            }
        });
        document.querySelectorAll('controller')[0].addEventListener('touchend', function (ev) {
        });
    };
    return Controller;
}());



},{}]},{},[1]);

//# sourceMappingURL=index.js.map
