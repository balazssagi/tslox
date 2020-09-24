import { Scanner } from "./Scanner"
import { Parser } from "./Parser"
import { Interpreter, RuntimeError } from "./Interpreter"
import { Resolver } from "./Resolver"
import { Stmt } from "./Stmt"
import { Token } from "./Token"

type ErrorReporter = (input: {line: number, message: string, formattedMessage: string}) => void
type Options = {stdOut?: (message: string) => void, errorReporter?: ErrorReporter}

const defaultErrorReporter: ErrorReporter = ({formattedMessage}) => {
    console.error(formattedMessage)
}

export class Lox {
    private hasError = false
    private stdOut
    private errorReporter: ErrorReporter
    private interpreter: Interpreter

    constructor(options?: Options) {
        this.stdOut = options?.stdOut ?? console.log
        this.errorReporter = options?.errorReporter ?? defaultErrorReporter
        this.interpreter = new Interpreter(this.stdOut, this.reportRuntimeError)
    }
    
    public parse(source: string) {
        this.reset()

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

    public run(statements: Stmt[]) {
        this.interpreter.interpret(statements)
    }

    private reset() {
        this.interpreter = new Interpreter(this.stdOut, this.reportRuntimeError)
        this.hasError = false
    }
    
    private reportRuntimeError = (error: RuntimeError) => {
        this.errorReporter({
            line: error.token.line,
            message: error.message,
            formattedMessage: `${error.message}`
        })
    }

    private reportError = (token: Token, message: string) => {
        this.errorReporter({
            line: token.line,
            message,
            formattedMessage: `Error at '${token.lexeme}': ${message}`
        })
        this.hasError = true
    }

    private reportScannerError = (line: number, message: string) => {
        this.errorReporter({
            line: line,
            message,
            formattedMessage: `Error: ${message}`
        })
        this.hasError = true
    }
}