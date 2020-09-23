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
var Callable_1 = require("./Callable");
var globals_1 = require("./globals");
var Return_1 = require("./Return");
var LoxInstance_1 = require("./LoxInstance");
var Interpreter = /** @class */ (function () {
    function Interpreter(stdout, reportRuntimeError) {
        this.stdout = stdout;
        this.reportRuntimeError = reportRuntimeError;
        this.globals = new Environment_1.Environment();
        this.environment = this.globals;
        this.locals = new Map();
        for (var _i = 0, _a = Object.entries(globals_1.globals); _i < _a.length; _i++) {
            var _b = _a[_i], name_1 = _b[0], loxFunction = _b[1];
            this.environment.define(name_1, loxFunction);
        }
    }
    Interpreter.prototype.visitFunctionStmt = function (stmt) {
        var fn = new Callable_1.LoxFunction(stmt, this.environment, false);
        this.environment.define(stmt.name.lexeme, fn);
    };
    Interpreter.prototype.visitVarStmt = function (stmt) {
        var value = null;
        if (stmt.initializer !== undefined) {
            value = this.evaulate(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, value);
    };
    Interpreter.prototype.visitClassStmt = function (stmt) {
        var superclass;
        if (stmt.superclass !== undefined) {
            var value = this.evaulate(stmt.superclass);
            if (!(value instanceof Callable_1.LoxClass)) {
                throw new RuntimeError(stmt.superclass.name, "Superclass must be a class.");
            }
            superclass = value;
        }
        this.environment.define(stmt.name.lexeme, null);
        if (superclass !== undefined) {
            this.environment = new Environment_1.Environment(this.environment);
            this.environment.define("super", superclass);
        }
        var methods = new Map();
        for (var _i = 0, _a = stmt.methods; _i < _a.length; _i++) {
            var method = _a[_i];
            var fn = new Callable_1.LoxFunction(method, this.environment, method.name.lexeme === 'init');
            methods.set(method.name.lexeme, fn);
        }
        var loxClass = new Callable_1.LoxClass(stmt.name.lexeme, superclass, methods);
        if (superclass !== undefined) {
            this.environment = this.environment.enclosing;
        }
        this.environment.assign(stmt.name, loxClass);
    };
    Interpreter.prototype.visitExpressionStmt = function (stmt) {
        this.evaulate(stmt.expression);
    };
    Interpreter.prototype.visitPrintStmt = function (stmt) {
        var value = this.evaulate(stmt.expression);
        this.stdout(this.stringify(value));
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
        var value = this.lookUpVariable(expr.name, expr);
        if (value === undefined) {
            // ???
            throw new RuntimeError(expr.name, "Failed to find variable: " + expr.name.lexeme);
        }
        return value;
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
    Interpreter.prototype.visitGetExpr = function (expr) {
        var object = this.evaulate(expr.object);
        if (object instanceof LoxInstance_1.LoxInstance) {
            return object.get(expr.name);
        }
        throw new RuntimeError(expr.name, "Only instances have properties.");
    };
    Interpreter.prototype.visitSetExpr = function (expr) {
        var object = this.evaulate(expr.object);
        if (!(object instanceof LoxInstance_1.LoxInstance)) {
            throw new RuntimeError(expr.name, "Only instances have properties.");
        }
        var value = this.evaulate(expr.value);
        object.set(expr.name, value);
        return value;
    };
    Interpreter.prototype.visitThisExpr = function (expr) {
        var value = this.lookUpVariable(expr.keyword, expr);
        if (value === undefined) {
            // ???
            throw new RuntimeError(expr.keyword, '');
        }
        return value;
    };
    Interpreter.prototype.visitSuperExpr = function (expr) {
        var distance = this.locals.get(expr);
        var superclass = this.environment.getAt(distance, "super");
        var object = this.environment.getAt(distance - 1, "this");
        var method = superclass.findMethod(expr.method.lexeme);
        if (method === undefined) {
            throw new RuntimeError(expr.keyword, "Undefined property '" + expr.method.lexeme + "'.");
        }
        return method.bind(object);
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
        var distance = this.locals.get(expr);
        if (distance !== undefined) {
            this.environment.assignAt(distance, expr.name, value);
        }
        else {
            this.globals.assign(expr.name, value);
        }
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
            if (e instanceof RuntimeError) {
                this.reportRuntimeError(e);
            }
        }
    };
    Interpreter.prototype.resolve = function (expr, depth) {
        this.locals.set(expr, depth);
    };
    Interpreter.prototype.lookUpVariable = function (name, expr) {
        var distance = this.locals.get(expr);
        if (distance !== undefined) {
            return this.environment.getAt(distance, name.lexeme);
        }
        return this.globals.get(name);
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
        Object.setPrototypeOf(_this, RuntimeError.prototype);
        return _this;
    }
    return RuntimeError;
}(Error));
exports.RuntimeError = RuntimeError;
//# sourceMappingURL=Interpreter.js.map