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
var Environment_1 = require("./Environment");
var Lox_1 = require("./Lox");
var Callable_1 = require("./Callable");
var globals_1 = require("./globals");
var Return_1 = require("./Return");
var Interpreter = /** @class */ (function () {
    function Interpreter() {
        this.globals = new Environment_1.Environment();
        this.environment = this.globals;
        for (var _i = 0, _a = Object.entries(globals_1.globals); _i < _a.length; _i++) {
            var _b = _a[_i], name_1 = _b[0], loxFunction = _b[1];
            this.environment.define(name_1, loxFunction);
        }
    }
    Interpreter.prototype.visitFunctionStmt = function (stmt) {
        var fn = new Callable_1.LoxFunction(stmt, this.environment);
        this.environment.define(stmt.name.lexeme, fn);
    };
    Interpreter.prototype.visitVarStmt = function (stmt) {
        var value = null;
        if (stmt.initializer !== undefined) {
            value = this.evaulate(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, value);
    };
    Interpreter.prototype.visitExpressionStmt = function (stmt) {
        this.evaulate(stmt.expression);
    };
    Interpreter.prototype.visitPrintStmt = function (stmt) {
        var value = this.evaulate(stmt.expression);
        console.log(this.stringify(value));
    };
    Interpreter.prototype.visitIfStmt = function (stmt) {
        if (this.isTruthy(this.evaulate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        }
        else if (stmt.elseBranch) {
            this.execute(stmt.elseBranch);
        }
    };
    Interpreter.prototype.visitWhileStmt = function (stmt) {
        while (this.evaulate(stmt.condition)) {
            this.execute(stmt.body);
        }
    };
    Interpreter.prototype.visitReturnStmt = function (stmt) {
        var value = null;
        if (stmt.value) {
            value = this.evaulate(stmt.value);
        }
        throw new Return_1.Return(value);
    };
    Interpreter.prototype.visitBlockStmt = function (stmt) {
        this.executeBlock(stmt.statements, new Environment_1.Environment(this.environment));
    };
    Interpreter.prototype.visitVariableExpr = function (expr) {
        return this.environment.get(expr.name);
    };
    Interpreter.prototype.visitLiteralExpr = function (expr) {
        return expr.value;
    };
    Interpreter.prototype.visitGroupingExpr = function (expr) {
        return this.evaulate(expr.expression);
    };
    Interpreter.prototype.visitCallExpr = function (expr) {
        var _this = this;
        var callee = this.evaulate(expr.callee);
        var args = expr.args.map(function (arg) { return _this.evaulate(arg); });
        if (!(callee instanceof Callable_1.Callable)) {
            throw new RuntimeError(expr.token, "Can only call functions and classes.");
        }
        if (args.length !== callee.arity()) {
            throw new RuntimeError(expr.token, "Expected " + callee.arity() + " arguments but got " + args.length + ".");
        }
        return callee.call(this, args);
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
                if (right === 0) {
                    throw new RuntimeError(expr.operator, 'Division by zero is not allowed.');
                }
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
        // ???
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
    Interpreter.prototype.visitLogicalExpr = function (expr) {
        var left = this.evaulate(expr.left);
        if (expr.operator.type == 'OR') {
            if (this.isTruthy(left))
                return left;
        }
        else {
            if (!this.isTruthy(left))
                return left;
        }
        return this.evaulate(expr.right);
    };
    Interpreter.prototype.visitAssignExpr = function (expr) {
        var value = this.evaulate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
    };
    Interpreter.prototype.interpret = function (statements) {
        try {
            for (var _i = 0, statements_1 = statements; _i < statements_1.length; _i++) {
                var statement = statements_1[_i];
                this.execute(statement);
            }
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
    Interpreter.prototype.execute = function (stmt) {
        return stmt.accept(this);
    };
    Interpreter.prototype.executeBlock = function (statements, environment) {
        var prevEnvironment = this.environment;
        try {
            this.environment = environment;
            for (var _i = 0, statements_2 = statements; _i < statements_2.length; _i++) {
                var statement = statements_2[_i];
                this.execute(statement);
            }
        }
        finally {
            this.environment = prevEnvironment;
        }
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
