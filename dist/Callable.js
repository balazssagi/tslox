"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeFunction = exports.LoxFunction = exports.Callable = void 0;
var Environment_1 = require("./Environment");
var Return_1 = require("./Return");
var Callable = /** @class */ (function () {
    function Callable() {
    }
    return Callable;
}());
exports.Callable = Callable;
var LoxFunction = /** @class */ (function (_super) {
    __extends(LoxFunction, _super);
    function LoxFunction(declaration, closure) {
        var _this = _super.call(this) || this;
        _this.declaration = declaration;
        _this.closure = closure;
        return _this;
    }
    LoxFunction.prototype.call = function (interpreter, args) {
        var environment = new Environment_1.Environment(this.closure);
        for (var i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }
        try {
            interpreter.executeBlock(this.declaration.body, environment);
        }
        catch (e) {
            if (e instanceof Return_1.Return) {
                return e.value;
            }
            throw (e);
        }
        return null;
    };
    LoxFunction.prototype.arity = function () {
        return this.declaration.params.length;
    };
    LoxFunction.prototype.toString = function () {
        return "fn <" + this.declaration.name.lexeme + ">";
    };
    return LoxFunction;
}(Callable));
exports.LoxFunction = LoxFunction;
var NativeFunction = /** @class */ (function (_super) {
    __extends(NativeFunction, _super);
    function NativeFunction(_arity, _call) {
        var _this = _super.call(this) || this;
        _this._arity = _arity;
        _this._call = _call;
        return _this;
    }
    NativeFunction.prototype.call = function (_, args) {
        return this._call.apply(this, args);
    };
    NativeFunction.prototype.arity = function () {
        return this._arity;
    };
    NativeFunction.prototype.toString = function () {
        return '<native fn>';
    };
    return NativeFunction;
}(Callable));
exports.NativeFunction = NativeFunction;
