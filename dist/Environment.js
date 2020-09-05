"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var Interpreter_1 = require("./Interpreter");
var Environment = /** @class */ (function () {
    function Environment(enclosing) {
        this.enclosing = enclosing;
        this.values = new Map();
    }
    Environment.prototype.define = function (name, value) {
        this.values.set(name, value);
    };
    Environment.prototype.assign = function (name, value) {
        if (!this.values.has(name.lexeme)) {
            if (this.enclosing) {
                this.enclosing.assign(name, value);
                return;
            }
            throw new Interpreter_1.RuntimeError(name, "Undefined variable: " + name.lexeme + ".");
        }
        this.values.set(name.lexeme, value);
    };
    Environment.prototype.get = function (name) {
        var value = this.values.get(name.lexeme);
        if (value !== undefined) {
            return value;
        }
        if (this.enclosing) {
            return this.enclosing.get(name);
        }
        throw new Interpreter_1.RuntimeError(name, "Undefined variable: " + name.lexeme + ".");
    };
    Environment.prototype.getAt = function (distance, name) {
        return this.ancestor(distance).values.get(name);
    };
    Environment.prototype.assignAt = function (distance, name, value) {
        return this.ancestor(distance).values.set(name.lexeme, value);
    };
    Environment.prototype.ancestor = function (distance) {
        var environment = this;
        for (var i = 0; i < distance; i++) {
            if (environment.enclosing) {
                environment = environment.enclosing;
            }
        }
        return environment;
    };
    return Environment;
}());
exports.Environment = Environment;
