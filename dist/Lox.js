"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lox = void 0;
var Scanner_1 = require("./Scanner");
var readline_1 = __importDefault(require("readline"));
var fs_1 = __importDefault(require("fs"));
var Parser_1 = require("./Parser");
var Interpreter_1 = require("./Interpreter");
var Resolver_1 = require("./Resolver");
var Lox = /** @class */ (function () {
    function Lox() {
    }
    Lox.runFile = function (path) {
        var source = fs_1.default.readFileSync(path, 'utf-8');
        Lox.run(source);
        if (Lox.hadError) {
            process.exit(65);
        }
        if (Lox.hadRuntimeError) {
            process.exit(70);
        }
    };
    Lox.runPrompt = function () {
        var rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('line', function (line) {
            Lox.run(line);
            Lox.hadError = false;
        });
        rl.prompt();
    };
    Lox.run = function (source) {
        var scanner = new Scanner_1.Scanner(source);
        var tokens = scanner.scanTokens();
        var parser = new Parser_1.Parser(tokens);
        var statements = parser.parse();
        if (this.hadError) {
            return;
        }
        var resolver = new Resolver_1.Resolver(this.interpreter);
        resolver.resolveStatements(statements);
        if (this.hadError) {
            return;
        }
        this.interpreter.interpret(statements);
    };
    Lox.runtimeError = function (error) {
        console.error("[line " + error.token.line + "] Runtime error: " + error.message);
        this.hadRuntimeError = true;
    };
    Lox.error = function (line, message) {
        Lox.report(line, '', message);
    };
    Lox.report = function (line, where, message) {
        console.error("[line " + line + "] Error " + where + ": " + message);
        Lox.hadError = true;
    };
    Lox.hadError = false;
    Lox.hadRuntimeError = false;
    Lox.interpreter = new Interpreter_1.Interpreter();
    return Lox;
}());
exports.Lox = Lox;
