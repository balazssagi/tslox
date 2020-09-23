"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
var Token = /** @class */ (function () {
    function Token(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    Token.prototype.toString = function () {
        return this.type + " " + this.lexeme + ", " + this.literal;
    };
    return Token;
}());
exports.Token = Token;
//# sourceMappingURL=Token.js.map