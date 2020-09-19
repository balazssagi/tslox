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
exports.Parser = void 0;
var Expr_1 = require("./Expr");
var Lox_1 = require("./Lox");
var Stmt_1 = require("./Stmt");
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }
    Parser.prototype.parse = function () {
        var statements = [];
        while (!this.isAtEnd()) {
            var declaration = this.declaration();
            if (declaration) {
                statements.push(declaration);
            }
        }
        return statements;
    };
    Parser.prototype.declaration = function () {
        try {
            if (this.match('CLASS')) {
                return this.classDeclaration();
            }
            if (this.match('FUN')) {
                return this.function('function');
            }
            if (this.match('VAR')) {
                return this.varDeclaration();
            }
            return this.statement();
        }
        catch (e) {
            this.synchronize();
            return null;
        }
    };
    Parser.prototype.function = function (kind) {
        var name = this.consume('IDENTIFIER', "Expect " + kind + " name.");
        this.consume('LEFT_PAREN', "Expect '(' after " + kind + " name.");
        var params = [];
        if (!this.check('RIGHT_PAREN')) {
            do {
                if (params.length >= 255) {
                    this.error(this.peek(), 'Cannot have more than 255 parameters.');
                }
                params.push(this.consume('IDENTIFIER', 'Expect parameter name.'));
            } while (this.match('COMMA'));
        }
        this.consume('RIGHT_PAREN', "Expect ')' after parameters.");
        this.consume('LEFT_BRACE', "Expect '{' before " + kind + " body.");
        var body = this.blockStatemnt();
        return new Stmt_1.FunctionStmt(name, params, body.statements);
    };
    Parser.prototype.classDeclaration = function () {
        var name = this.consume('IDENTIFIER', 'Expect class name.');
        this.consume('LEFT_BRACE', "Expect '{' before class body.");
        var methods = [];
        while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
            methods.push(this.function('method'));
        }
        this.consume('RIGHT_BRACE', "Expect '}' after class body.");
        return new Stmt_1.ClassStmt(name, methods);
    };
    Parser.prototype.varDeclaration = function () {
        var name = this.consume('IDENTIFIER', "Expect variable name.");
        var initializer;
        if (this.match('EQUAL')) {
            initializer = this.expression();
        }
        this.consume('SEMICOLON', "Expect ';' after variable declaration.");
        return new Stmt_1.VarStmt(name, initializer);
    };
    Parser.prototype.statement = function () {
        if (this.match('IF')) {
            return this.ifStatement();
        }
        if (this.match('WHILE')) {
            return this.whileStatement();
        }
        if (this.match('FOR')) {
            return this.forStatement();
        }
        if (this.match('PRINT')) {
            return this.printStatement();
        }
        if (this.match('LEFT_BRACE')) {
            return this.blockStatemnt();
        }
        if (this.match('RETURN')) {
            return this.returnStatement();
        }
        return this.expressionStatement();
    };
    Parser.prototype.ifStatement = function () {
        this.consume('LEFT_PAREN', "Expect '(' after 'if'.");
        var condition = this.expression();
        this.consume('RIGHT_PAREN', "Expect ')' after if condition.");
        var thenBranch = this.statement();
        var elseBranch;
        if (this.match('ELSE')) {
            elseBranch = this.statement();
        }
        return new Stmt_1.IfStmt(condition, thenBranch, elseBranch);
    };
    Parser.prototype.whileStatement = function () {
        this.consume('LEFT_PAREN', "Expect '(' after 'while'.");
        var condition = this.expression();
        this.consume('RIGHT_PAREN', "Expect ')' after 'while' condition.");
        var body = this.statement();
        return new Stmt_1.WhileStmt(condition, body);
    };
    Parser.prototype.forStatement = function () {
        this.consume('LEFT_PAREN', "Expect '(' after 'for'.");
        var initializer;
        if (this.match('SEMICOLON')) { }
        else if (this.match('VAR')) {
            initializer = this.varDeclaration();
        }
        else {
            initializer = this.expressionStatement();
        }
        var condition;
        if (!this.match('SEMICOLON')) {
            condition = this.expression();
        }
        else {
            condition = new Expr_1.LiteralExpr(true);
        }
        this.consume('SEMICOLON', "Expect ';' after loop condition.");
        var increment;
        if (!this.check('RIGHT_PAREN')) {
            increment = this.expression();
        }
        this.consume('RIGHT_PAREN', "Expect ')' after for clauses.");
        var body = this.statement();
        if (increment) {
            body = new Stmt_1.BlockStmt([body, new Stmt_1.ExpressionStmt(increment)]);
        }
        body = new Stmt_1.WhileStmt(condition, body);
        if (initializer) {
            body = new Stmt_1.BlockStmt([initializer, body]);
        }
        return body;
    };
    Parser.prototype.printStatement = function () {
        var expr = this.expression();
        this.consume('SEMICOLON', "Expect ';' after value.");
        return new Stmt_1.PrintStmt(expr);
    };
    Parser.prototype.blockStatemnt = function () {
        var statements = [];
        while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
            var statement = this.declaration();
            if (statement) {
                statements.push(statement);
            }
        }
        this.consume('RIGHT_BRACE', "Expect '}' after block.");
        return new Stmt_1.BlockStmt(statements);
    };
    Parser.prototype.returnStatement = function () {
        var keyword = this.previous();
        var value = undefined;
        if (!this.check('SEMICOLON')) {
            value = this.expression();
        }
        this.consume('SEMICOLON', "Expect ';' after return value.");
        return new Stmt_1.ReturnStmt(keyword, value);
    };
    Parser.prototype.expressionStatement = function () {
        var expr = this.expression();
        this.consume('SEMICOLON', "Expect ';' after expression.");
        return new Stmt_1.ExpressionStmt(expr);
    };
    Parser.prototype.expression = function () {
        return this.assignment();
    };
    Parser.prototype.assignment = function () {
        var expr = this.or();
        if (this.match('EQUAL')) {
            var equals = this.previous();
            var value = this.or();
            if (expr instanceof Expr_1.VariableExpr) {
                var name_1 = expr.name;
                return new Expr_1.AssignExpr(name_1, value);
            }
            else if (expr instanceof Expr_1.GetExpr) {
                return new Expr_1.SetExpr(expr.object, expr.name, value);
            }
            this.error(equals, 'Invalid left-hand side in assignment.');
        }
        return expr;
    };
    Parser.prototype.or = function () {
        var expr = this.and();
        while (this.match('OR')) {
            var operator = this.previous();
            var right = this.and();
            return new Expr_1.LogicalExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.and = function () {
        var expr = this.equality();
        while (this.match('AND')) {
            var operator = this.previous();
            var right = this.equality();
            return new Expr_1.LogicalExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.equality = function () {
        var expr = this.comparison();
        while (this.match('BANG_EQUAL', 'EQUAL_EQUAL')) {
            var operator = this.previous();
            var right = this.comparison();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.comparison = function () {
        var expr = this.addition();
        while (this.match('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL')) {
            var operator = this.previous();
            var right = this.addition();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.addition = function () {
        var expr = this.multiplication();
        while (this.match('MINUS', 'PLUS')) {
            var operator = this.previous();
            var right = this.multiplication();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.multiplication = function () {
        var expr = this.unary();
        while (this.match('SLASH', 'STAR')) {
            var operator = this.previous();
            var right = this.unary();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.unary = function () {
        if (this.match('BANG', 'MINUS')) {
            var operator = this.previous();
            var right = this.unary();
            return new Expr_1.UnaryExpr(operator, right);
        }
        return this.call();
    };
    Parser.prototype.call = function () {
        var expr = this.primary();
        while (true) {
            if (this.match('LEFT_PAREN')) {
                expr = this.finishCall(expr);
            }
            else if (this.match('DOT')) {
                var name_2 = this.consume('IDENTIFIER', "Expect property name after '.'.");
                expr = new Expr_1.GetExpr(expr, name_2);
            }
            else {
                break;
            }
        }
        return expr;
    };
    Parser.prototype.primary = function () {
        if (this.match('FALSE'))
            return new Expr_1.LiteralExpr(false);
        if (this.match('TRUE'))
            return new Expr_1.LiteralExpr(true);
        if (this.match('NIL'))
            return new Expr_1.LiteralExpr(null);
        if (this.match('NUMBER', 'STRING')) {
            return new Expr_1.LiteralExpr(this.previous().literal);
        }
        if (this.match('LEFT_PAREN')) {
            var expr = this.expression();
            this.consume('RIGHT_PAREN', "Expect ')' after expression.");
            return new Expr_1.GroupingExpr(expr);
        }
        if (this.match('THIS')) {
            return new Expr_1.ThisExpr(this.previous());
        }
        if (this.match('IDENTIFIER')) {
            return new Expr_1.VariableExpr(this.previous());
        }
        throw this.error(this.peek(), "Expect expression.");
    };
    Parser.prototype.finishCall = function (callee) {
        var args = [];
        if (!this.check('RIGHT_PAREN')) {
            do {
                if (arguments.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.");
                }
                args.push(this.expression());
            } while (this.match('COMMA'));
        }
        var token = this.consume('RIGHT_PAREN', "Expect ')' after arguments.");
        return new Expr_1.CallExpr(callee, token, args);
    };
    Parser.prototype.error = function (token, message) {
        Lox_1.Lox.error(token.line, message);
        return new ParseError();
    };
    Parser.prototype.consume = function (type, message) {
        if (this.check(type)) {
            return this.advance();
        }
        throw this.error(this.peek(), message);
    };
    Parser.prototype.match = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        for (var _a = 0, types_1 = types; _a < types_1.length; _a++) {
            var type = types_1[_a];
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    };
    Parser.prototype.check = function (type) {
        if (this.isAtEnd()) {
            return false;
        }
        return this.peek().type === type;
    };
    Parser.prototype.advance = function () {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.previous();
    };
    Parser.prototype.isAtEnd = function () {
        return this.peek().type === 'EOF';
    };
    Parser.prototype.peek = function () {
        return this.tokens[this.current];
    };
    Parser.prototype.previous = function () {
        return this.tokens[this.current - 1];
    };
    Parser.prototype.synchronize = function () {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === 'SEMICOLON') {
                return;
            }
            switch (this.peek().type) {
                case 'CLASS':
                case 'FUN':
                case 'VAR':
                case 'FOR':
                case 'IF':
                case 'WHILE':
                case 'PRINT':
                case 'RETURN':
                    return;
            }
            this.advance();
        }
    };
    return Parser;
}());
exports.Parser = Parser;
var ParseError = /** @class */ (function (_super) {
    __extends(ParseError, _super);
    function ParseError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ParseError;
}(Error));
