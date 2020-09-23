"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globals = void 0;
var Callable_1 = require("./Callable");
exports.globals = {
    'clock': new Callable_1.NativeFunction(0, function () { return Date.now(); }),
};
//# sourceMappingURL=globals.js.map