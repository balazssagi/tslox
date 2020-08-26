import { Scanner } from "./Scanner"
import readline from 'readline'
import fs from 'fs'
import { TokenType } from "./TokenType"
import { Token } from "./Token"

export class Lox {
    static hadError = false

    static runFile(path: string) {
        const source = fs.readFileSync(path, 'utf-8')
        Lox.run(source)

        if (Lox.hadError) {
            process.exit(65)
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

        tokens.forEach(token => {
            const a = new Token(TokenType.BANG, '!', {}, 1)
            console.log(a)
        })
    }

    static error(line: number, message: string) {
        Lox.report(line, '', message)
    }

    private static report(line: number, where: string, message: string) {
        console.error(`[line ${line}] Error ${where}: ${message}`)
        Lox.hadError = true
    }
}