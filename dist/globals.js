"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globals = void 0;
var Callable_1 = require("./Callable");
exports.globals = {
    'clock': new Callable_1.LoxFunction(function () { return Date.now(); }, function () { return 0; }),
};
Object.values(exports.globals).forEach(function (global) { return global.toString = function () { return '<native fn>'; }; });
