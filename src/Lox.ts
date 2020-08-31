import { Scanner } from "./Scanner"
import readline from 'readline'
import fs from 'fs'
import { TokenType } from "./TokenType"
import { Token } from "./Token"
import { Parser } from "./Parser"
import { Interpreter, RuntimeError } from "./Interpreter"

export class Lox {
    static hadError = false
    static hadRuntimeError = false
    static interpreter = new Interpreter()

    static runFile(path: string) {
        const source = fs.readFileSync(path, 'utf-8')
        Lox.run(source)

        if (Lox.hadError) {
            process.exit(65)
        }
        if (Lox.hadRuntimeError) {
            process.exit(70)
        }
    }

    static runPrompt() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('line', (line) => {
            Lox.run(line)
            Lox.hadError = false
        })
        rl.prompt()
    }

    private static run(source: string) {
        const scanner = new Scanner(source)
        const tokens = scanner.scanTokens()
        const parser = new Parser(tokens)
        const statements = parser.parse()

        if (this.hadError) {
            return
        }

        this.interpreter.interpret(statements)
    }

    static runtimeError(error: RuntimeError) {
        console.error(`[line ${error.token.line}] Runtime error: ${error.message}`)
        this.hadRuntimeError = true
    }

    static error(line: number, message: string) {
        Lox.report(line, '', message)
    }

    private static report(line: number, where: string, message: string) {
        console.error(`[line ${line}] Error ${where}: ${message}`)
        Lox.hadError = true
    }
}