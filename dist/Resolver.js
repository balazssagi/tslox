"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
var Lox_1 = require("./Lox");
var Resolver = /** @class */ (function () {
    function Resolver(interpreter) {
        this.interpreter = interpreter;
        this.scopes = [];
        this.currentFunction = 'none';
    }
    Resolver.prototype.visitBlockStmt = function (stmt) {
        this.beginScope();
        this.resolveStatements(stmt.statements);
        this.endScope();
    };
    Resolver.prototype.visitVarStmt = function (stmt) {
        this.declare(stmt.name);
        if (stmt.initializer !== undefined) {
            this.resolveExpression(stmt.initializer);
        }
        this.define(stmt.name);
    };
    Resolver.prototype.visitVariableExpr = function (expr) {
        if (this.scopes.length !== 0 && this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false) {
            Lox_1.Lox.error(expr.name.line, "Cannot read local variable in its own initializer.");
        }
        this.resolveLocal(expr, expr.name);
    };
    Resolver.prototype.visitAssignExpr = function (expr) {
        this.resolveExpression(expr.value);
        this.resolveLocal(expr, expr.name);
    };
    Resolver.prototype.visitFunctionStmt = function (stmt) {
        this.declare(stmt.name);
        this.define(stmt.name);
        this.resolveFunction(stmt, 'function');
    };
    Resolver.prototype.visitExpressionStmt = function (stmt) {
        this.resolveExpression(stmt.expression);
    };
    Resolver.prototype.visitIfStmt = function (stmt) {
        this.resolveExpression(stmt.condition);
        this.resolveStatement(stmt.thenBranch);
        if (stmt.elseBranch !== undefined) {
            this.resolveStatement(stmt.elseBranch);
        }
    };
    Resolver.prototype.visitPrintStmt = function (stmt) {
        this.resolveExpression(stmt.expression);
    };
    Resolver.prototype.visitReturnStmt = function (stmt) {
        if (this.currentFunction === 'none') {
            Lox_1.Lox.error(stmt.keyword.line, "Cannot return from top-level code.");
        }
        if (stmt.value !== undefined) {
            this.resolveExpression(stmt.value);
        }
    };
    Resolver.prototype.visitWhileStmt = function (stmt) {
        this.resolveExpression(stmt.condition);
        this.resolveStatement(stmt.body);
    };
    Resolver.prototype.visitBinaryExpr = function (expr) {
        this.resolveExpression(expr.left);
        this.resolveExpression(expr.right);
    };
    Resolver.prototype.visitCallExpr = function (expr) {
        this.resolveExpression(expr.callee);
        for (var _i = 0, _a = expr.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            this.resolveExpression(arg);
        }
    };
    Resolver.prototype.visitGroupingExpr = function (expr) {
        this.resolveExpression(expr.expression);
    };
    Resolver.prototype.visitLiteralExpr = function (expr) {
    };
    Resolver.prototype.visitLogicalExpr = function (expr) {
        this.resolveExpression(expr.left);
        this.resolveExpression(expr.right);
    };
    Resolver.prototype.visitUnaryExpr = function (expr) {
        this.resolveExpression(expr.right);
    };
    Resolver.prototype.resolveFunction = function (stmt, type) {
        var enclosingFunction = this.currentFunction;
        this.currentFunction = type;
        this.beginScope();
        for (var _i = 0, _a = stmt.params; _i < _a.length; _i++) {
            var param = _a[_i];
            this.declare(param);
            this.define(param);
        }
        this.resolveStatements(stmt.body);
        this.endScope();
        this.currentFunction = enclosingFunction;
    };
    Resolver.prototype.resolveStatements = function (stmts) {
        for (var _i = 0, stmts_1 = stmts; _i < stmts_1.length; _i++) {
            var stmt = stmts_1[_i];
            this.resolveStatement(stmt);
        }
    };
    Resolver.prototype.declare = function (name) {
        if (this.scopes.length === 0) {
            return;
        }
        var scope = this.scopes[this.scopes.length - 1];
        if (scope.has(name.lexeme)) {
            Lox_1.Lox.error(name.line, "Variable with this name already declared in this scope.");
        }
        scope.set(name.lexeme, false);
    };
    Resolver.prototype.define = function (name) {
        if (this.scopes.length === 0) {
            return;
        }
        var scope = this.scopes[this.scopes.length - 1];
        scope.set(name.lexeme, true);
    };
    Resolver.prototype.resolveStatement = function (stmt) {
        stmt.accept(this);
    };
    Resolver.prototype.resolveExpression = function (expr) {
        expr.accept(this);
    };
    Resolver.prototype.resolveLocal = function (expr, name) {
        for (var i = 0; i < this.scopes.length; i++) {
            var scope = this.scopes[i];
            if (scope.has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
                return;
            }
        }
    };
    Resolver.prototype.beginScope = function () {
        this.scopes.push(new Map());
    };
    Resolver.prototype.endScope = function () {
        this.scopes.pop();
    };
    return Resolver;
}());
exports.Resolver = Resolver;
