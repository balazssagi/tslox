"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lox_1 = require("./Lox");
function runLox() {
    var argv = process.argv;
    if (argv.length > 3) {
        console.log('Too many arguments.');
        process.exit(64);
    }
    else if (argv.length === 3) {
        Lox_1.Lox.runFile(argv[2]);
    }
    else {
        Lox_1.Lox.runPrompt();
    }
}
runLox();
