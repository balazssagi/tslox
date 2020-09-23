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
exports.LoxClass = exports.NativeFunction = exports.LoxFunction = exports.Callable = void 0;
var Environment_1 = require("./Environment");
var LoxInstance_1 = require("./LoxInstance");
var Return_1 = require("./Return");
var Callable = /** @class */ (function () {
    function Callable() {
    }
    return Callable;
}());
exports.Callable = Callable;
var LoxFunction = /** @class */ (function (_super) {
    __extends(LoxFunction, _super);
    function LoxFunction(declaration, closure, isInitiazlier) {
        var _this = _super.call(this) || this;
        _this.declaration = declaration;
        _this.closure = closure;
        _this.isInitiazlier = isInitiazlier;
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
                if (this.isInitiazlier) {
                    return this.closure.getAt(0, "this");
                }
                return e.value;
            }
            throw (e);
        }
        if (this.isInitiazlier) {
            return this.closure.getAt(0, "this");
        }
        return null;
    };
    LoxFunction.prototype.arity = function () {
        return this.declaration.params.length;
    };
    LoxFunction.prototype.bind = function (instance) {
        var envivornment = new Environment_1.Environment(this.closure);
        envivornment.define('this', instance);
        return new LoxFunction(this.declaration, envivornment, this.isInitiazlier);
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
var LoxClass = /** @class */ (function (_super) {
    __extends(LoxClass, _super);
    function LoxClass(name, superClass, methods) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.superClass = superClass;
        _this.methods = methods;
        return _this;
    }
    LoxClass.prototype.call = function (interpreter, args) {
        var instance = new LoxInstance_1.LoxInstance(this);
        var initializer = this.findMethod('init');
        if (initializer !== undefined) {
            initializer.bind(instance).call(interpreter, args);
        }
        return instance;
    };
    LoxClass.prototype.arity = function () {
        var initializer = this.findMethod('init');
        if (initializer !== undefined) {
            return initializer.arity();
        }
        return 0;
    };
    LoxClass.prototype.findMethod = function (name) {
        var _a;
        if (this.methods.has(name)) {
            return this.methods.get(name);
        }
        return (_a = this.superClass) === null || _a === void 0 ? void 0 : _a.findMethod(name);
    };
    LoxClass.prototype.toString = function () {
        return this.name;
    };
    return LoxClass;
}(Callable));
exports.LoxClass = LoxClass;
//# sourceMappingURL=Callable.js.map