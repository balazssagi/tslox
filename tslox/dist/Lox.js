"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lox = void 0;
var Scanner_1 = require("./Scanner");
var Parser_1 = require("./Parser");
var Interpreter_1 = require("./Interpreter");
var Resolver_1 = require("./Resolver");
var defaultErrorReporter = function (_a) {
    var formattedMessage = _a.formattedMessage;
    console.error(formattedMessage);
};
var Lox = /** @class */ (function () {
    function Lox(options) {
        var _this = this;
        var _a, _b;
        this.hasError = false;
        this.reportRuntimeError = function (error) {
            _this.errorReporter({
                line: error.token.line,
                message: error.message,
                formattedMessage: "[line " + error.token.line + "] Runtime Error: " + error.message
            });
        };
        this.reportError = function (line, message) {
            _this.errorReporter({
                line: line,
                message: message,
                formattedMessage: "[line " + line + "] Error: " + message
            });
            _this.hasError = true;
        };
        this.stdOut = (_a = options === null || options === void 0 ? void 0 : options.stdOut) !== null && _a !== void 0 ? _a : console.log;
        this.errorReporter = (_b = options === null || options === void 0 ? void 0 : options.errorReporter) !== null && _b !== void 0 ? _b : defaultErrorReporter;
        this.interpreter = new Interpreter_1.Interpreter(this.stdOut, this.reportRuntimeError);
    }
    Lox.prototype.parse = function (source) {
        this.reset();
        var scanner = new Scanner_1.Scanner(source, this.reportError);
        var tokens = scanner.scanTokens();
        var parser = new Parser_1.Parser(tokens, this.reportError);
        var statements = parser.parse();
        if (this.hasError) {
            return null;
        }
        var resolver = new Resolver_1.Resolver(this.interpreter, this.reportError);
        resolver.resolveStatements(statements);
        if (this.hasError) {
            return null;
        }
        return statements;
    };
    Lox.prototype.run = function (statements) {
        this.interpreter.interpret(statements);
    };
    Lox.prototype.reset = function () {
        this.interpreter = new Interpreter_1.Interpreter(this.stdOut, this.reportRuntimeError);
        this.hasError = false;
    };
    return Lox;
}());
exports.Lox = Lox;
//# sourceMappingURL=Lox.js.map