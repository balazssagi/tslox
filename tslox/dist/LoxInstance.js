"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoxInstance = void 0;
var Interpreter_1 = require("./Interpreter");
var LoxInstance = /** @class */ (function () {
    function LoxInstance(loxClass) {
        this.loxClass = loxClass;
        this.fields = new Map();
    }
    LoxInstance.prototype.get = function (name) {
        if (this.fields.has(name.lexeme)) {
            return this.fields.get(name.lexeme);
        }
        var method = this.loxClass.findMethod(name.lexeme);
        if (method !== undefined) {
            return method.bind(this);
        }
        throw new Interpreter_1.RuntimeError(name, "Undefined property '" + name.lexeme + "'.");
    };
    LoxInstance.prototype.set = function (name, value) {
        this.fields.set(name.lexeme, value);
    };
    LoxInstance.prototype.toString = function () {
        return this.loxClass + " instance";
    };
    return LoxInstance;
}());
exports.LoxInstance = LoxInstance;
//# sourceMappingURL=LoxInstance.js.map