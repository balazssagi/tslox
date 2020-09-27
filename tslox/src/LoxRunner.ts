import { Scanner } from "./Scanner"
import { Parser } from "./Parser"
import { Interpreter, RuntimeError } from "./Interpreter"
import { Resolver } from "./Resolver"
import { Stmt } from "./Stmt"
import { Token, TokenRange } from "./Token"

type ErrorReporter = (input: {position: TokenPosition, message: string, formattedMessage: string}) => void
type Options = {stdOut?: (message: string) => void, errorReporter?: ErrorReporter}

export type TokenPosition = {
    start: [line: number, column: number],
    end: [line: number, column: number],
}

const defaultErrorReporter: ErrorReporter = ({formattedMessage}) => {
    console.error(formattedMessage)
}

export class LoxRunner {
    private hasError = false
    private stdOut
    private errorReporter: ErrorReporter
    private interpreter: Interpreter
    private source: string | null = null

    constructor(options?: Options) {
        this.stdOut = options?.stdOut ?? console.log
        this.errorReporter = options?.errorReporter ?? defaultErrorReporter
        this.interpreter = new Interpreter(this.stdOut, this.reportRuntimeError)
    }
    
    public parse(source: string) {
        this.reset()
        this.source = source

        const scanner = new Scanner(source, this.reportScannerError)
        const tokens = scanner.scanTokens()
        const parser = new Parser(tokens, this.reportError)
        const statements = parser.parse()
        
        if (this.hasError) {
            return null
        }
        
        const resolver = new Resolver(this.interpreter, this.reportError)
        resolver.resolveStatements(statements)
    
        if (this.hasError) {
            return null
        }

        return statements
    }

    public interpret(statements: Stmt[]) {
        this.interpreter.interpret(statements)
    }

    private reset() {
        this.interpreter = new Interpreter(this.stdOut, this.reportRuntimeError)
        this.hasError = false
    }

    private tokenRangeToPosition(range: TokenRange) {
        const position: TokenPosition = {
            start: [1, 0],
            end: [1, 0],
        }

        for (let i = 0; i < range[1]; i++) {
            const key: keyof TokenPosition = i < range[0] ? 'start' : 'end' 
            position[key][1] = i + 1;
            if (this.source![i] === '\n') {
                position[key][0]++
                position[key][1] = 1
            }
        }

        return position
    }
    
    private reportRuntimeError = (error: RuntimeError) => {

        const position = this.tokenRangeToPosition(error.token.range) 

        this.errorReporter({
            position,
            message: error.message,
            formattedMessage: `${error.message}`
        })
    }

    private reportError = (token: Token, message: string) => {
        this.hasError = true;
        
        const position = this.tokenRangeToPosition(token.range) 

        if (token.type === 'EOF') {
            this.errorReporter({
                position,
                message,
                formattedMessage: `[Line ${position.start[0]}] Error at end: ${message}`
            })
        }
        else {
            this.errorReporter({
                position,
                message,
                formattedMessage: `[Line ${position.start[0]}] Error at '${token.lexeme}': ${message}`
            })
        }
    }

    private reportScannerError = (range: TokenRange, message: string) => {
        this.hasError = true

        const position = this.tokenRangeToPosition(range)

        this.errorReporter({
            position: position,
            message,
            formattedMessage: `[Line ${position.start[0]}] Error: ${message}`
        })
    }
}