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
exports.RuntimeError = exports.Interpreter = void 0;
var Lox_1 = require("./Lox");
var Interpreter = /** @class */ (function () {
    function Interpreter() {
    }
    Interpreter.prototype.visitLiteralExpr = function (expr) {
        return expr.value;
    };
    Interpreter.prototype.visitGroupingExpr = function (expr) {
        return this.evaulate(expr.expression);
    };
    Interpreter.prototype.visitBinaryExpr = function (expr) {
        var left = this.evaulate(expr.left);
        var right = this.evaulate(expr.right);
        switch (expr.operator.type) {
            case 'MINUS':
                this.checkNumberOperand(expr.operator, left);
                this.checkNumberOperand(expr.operator, right);
                return left - right;
            case 'SLASH':
                this.checkNumberOperand(expr.operator, left);
                this.checkNumberOperand(expr.operator, right);
                return left / right;
            case 'STAR':
                this.checkNumberOperand(expr.operator, left);
                this.checkNumberOperand(expr.operator, right);
                return left * right;
            case 'PLUS':
                if (typeof left === 'string' && typeof right === 'string') {
                    return left + right;
                }
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
            case 'GREATER':
                this.checkNumberOperand(expr.operator, left);
                this.checkNumberOperand(expr.operator, right);
                return left > right;
            case 'GREATER_EQUAL':
                this.checkNumberOperand(expr.operator, left);
                this.checkNumberOperand(expr.operator, right);
                return left >= right;
            case 'LESS':
                this.checkNumberOperand(expr.operator, left);
                this.checkNumberOperand(expr.operator, right);
                return left <= right;
            case 'LESS_EQUAL':
                this.checkNumberOperand(expr.operator, left);
                this.checkNumberOperand(expr.operator, right);
                return left <= right;
            case 'BANG_EQUAL':
                return !this.isEqual(left, right);
            case 'EQUAL_EQUAL':
                return this.isEqual(left, right);
        }
        throw new Error();
    };
    Interpreter.prototype.visitUnaryExpr = function (expr) {
        var right = this.evaulate(expr.right);
        switch (expr.operator.type) {
            case 'MINUS':
                this.checkNumberOperand(expr.operator, right);
                return -right;
            case 'BANG':
                return !this.isTruthy(right);
        }
        // ???
        throw new Error();
    };
    Interpreter.prototype.interpret = function (expr) {
        try {
            var value = this.evaulate(expr);
            console.log(this.stringify(value));
        }
        catch (e) {
            Lox_1.Lox.runtimeError(e);
        }
    };
    Interpreter.prototype.stringify = function (value) {
        if (value === null) {
            return 'nil';
        }
        return value.toString();
    };
    Interpreter.prototype.checkNumberOperand = function (operator, operand) {
        if (typeof operand === 'number') {
            return;
        }
        throw new RuntimeError(operator, 'Operand must be a number.');
    };
    Interpreter.prototype.isEqual = function (left, right) {
        return Object.is(left, right);
    };
    Interpreter.prototype.isTruthy = function (value) {
        if (value === null || value === false) {
            return false;
        }
        return true;
    };
    Interpreter.prototype.evaulate = function (expr) {
        return expr.accept(this);
    };
    return Interpreter;
}());
exports.Interpreter = Interpreter;
var RuntimeError = /** @class */ (function (_super) {
    __extends(RuntimeError, _super);
    function RuntimeError(token, message) {
        var _this = _super.call(this, message) || this;
        _this.token = token;
        return _this;
    }
    return RuntimeError;
}(Error));
exports.RuntimeError = RuntimeError;
