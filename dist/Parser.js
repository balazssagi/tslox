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
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }
    Parser.prototype.parse = function () {
        try {
            return this.expression();
        }
        catch (e) {
            return null;
        }
    };
    Parser.prototype.expression = function () {
        return this.equality();
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
        return this.primary();
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
        throw this.error(this.peek(), "Expect expression.");
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
