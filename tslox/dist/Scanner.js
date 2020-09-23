"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
var Token_1 = require("./Token");
var Scanner = /** @class */ (function () {
    function Scanner(source, reportError) {
        this.reportError = reportError;
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.source = source;
    }
    Scanner.prototype.isAtEnd = function () {
        return this.current >= this.source.length;
    };
    Scanner.prototype.scanToken = function () {
        var c = this.advance();
        switch (c) {
            case '(':
                this.addToken('LEFT_PAREN');
                break;
            case ')':
                this.addToken('RIGHT_PAREN');
                break;
            case '{':
                this.addToken('LEFT_BRACE');
                break;
            case '}':
                this.addToken('RIGHT_BRACE');
                break;
            case ',':
                this.addToken('COMMA');
                break;
            case '.':
                this.addToken('DOT');
                break;
            case '-':
                this.addToken('MINUS');
                break;
            case '+':
                this.addToken('PLUS');
                break;
            case ';':
                this.addToken('SEMICOLON');
                break;
            case '*':
                this.addToken('STAR');
                break;
            case '!':
                this.addToken(this.match('=') ? 'BANG_EQUAL' : 'BANG');
                break;
            case '=':
                this.addToken(this.match('=') ? 'EQUAL_EQUAL' : 'EQUAL');
                break;
            case '<':
                this.addToken(this.match('=') ? 'LESS_EQUAL' : 'LESS');
                break;
            case '>':
                this.addToken(this.match('=') ? 'GREATER_EQUAL' : 'GREATER');
                break;
            case '/':
                if (this.match('/')) {
                    while (this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                }
                else {
                    this.addToken('SLASH');
                }
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;
            case '"':
                this.string();
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    this.reportError(this.line, 'Unexpected character.');
                }
                break;
        }
    };
    Scanner.prototype.isAlpha = function (c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c == '_';
    };
    Scanner.prototype.isAlphaNumeric = function (c) {
        return this.isDigit(c) || this.isAlpha(c);
    };
    Scanner.prototype.identifier = function () {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }
        var text = this.source.substring(this.start, this.current);
        var type = Scanner.keywords[text];
        if (!type) {
            type = 'IDENTIFIER';
        }
        this.addToken(type);
    };
    Scanner.prototype.isDigit = function (c) {
        return c >= '0' && c <= '9';
    };
    Scanner.prototype.number = function () {
        while (this.isDigit(this.peek())) {
            this.advance();
        }
        if (this.peek() === '.' && this.isDigit(this.peek(1))) {
            this.advance();
            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }
        this.addToken('NUMBER', parseFloat(this.source.substring(this.start, this.current)));
    };
    Scanner.prototype.string = function () {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
            }
            this.advance();
        }
        if (this.isAtEnd()) {
            this.reportError(this.line, 'Unterminated string.');
            return;
        }
        this.advance();
        var value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken('STRING', value);
    };
    Scanner.prototype.peek = function (n) {
        if (n === void 0) { n = 0; }
        if (this.current + n >= this.source.length) {
            return '\0';
        }
        return this.source[this.current + n];
    };
    Scanner.prototype.match = function (expected) {
        if (this.isAtEnd()) {
            return false;
        }
        if (this.source[this.current] !== expected) {
            return false;
        }
        this.current++;
        return true;
    };
    Scanner.prototype.advance = function () {
        this.current++;
        return this.source[this.current - 1];
    };
    Scanner.prototype.addToken = function (token, literal) {
        var text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token_1.Token(token, text, literal, this.line));
    };
    Scanner.prototype.scanTokens = function () {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token_1.Token('EOF', "", undefined, this.line));
        return this.tokens;
    };
    Scanner.keywords = {
        "and": 'AND',
        "class": 'CLASS',
        "else": 'ELSE',
        "false": 'FALSE',
        "for": 'FOR',
        "fun": 'FUN',
        "if": 'IF',
        "nil": 'NIL',
        "or": 'OR',
        "print": 'PRINT',
        "return": 'RETURN',
        "super": 'SUPER',
        "this": 'THIS',
        "true": 'TRUE',
        "var": 'VAR',
        "while": 'WHILE',
    };
    return Scanner;
}());
exports.Scanner = Scanner;
//# sourceMappingURL=Scanner.js.map