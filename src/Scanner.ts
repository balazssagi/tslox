import { Lox } from "./Lox"
import { Token } from "./Token"
import { TokenType } from "./TokenType"

export class Scanner {
    private source
    private tokens: Token[] = []
    private start = 0
    private current = 0
    private line = 1

    constructor(source: string) {
        this.source = source
    }

    private static keywords: Record<string, TokenType> = {
        "and":    'AND',
        "class":  'CLASS',
        "else":   'ELSE',
        "false":  'FALSE',
        "for":    'FOR',
        "fun":    'FUN',
        "if":     'IF',
        "nil":    'NIL',
        "or":     'OR',
        "print":  'PRINT',
        "return": 'RETURN',
        "super":  'SUPER',
        "this":   'THIS',
        "true":   'TRUE',
        "var":    'VAR',
        "while":  'WHILE',
    } 

    private isAtEnd() {
        return this.current >= this.source.length
    }

    private scanToken() {
        const c = this.advance()
        switch (c) {
            case '(': this.addToken('LEFT_PAREN'); break;
            case ')': this.addToken('RIGHT_PAREN'); break;
            case '{': this.addToken('LEFT_BRACE'); break;
            case '}': this.addToken('RIGHT_BRACE'); break;
            case ',': this.addToken('COMMA'); break;
            case '.': this.addToken('DOT'); break;
            case '-': this.addToken('MINUS'); break;
            case '+': this.addToken('PLUS'); break;
            case ';': this.addToken('SEMICOLON'); break;
            case '*': this.addToken('STAR'); break;
            case '!': this.addToken(this.match('=') ? 'BANG_EQUAL' : 'BANG'); break;
            case '=': this.addToken(this.match('=') ? 'EQUAL_EQUAL' : 'EQUAL'); break;
            case '<': this.addToken(this.match('=') ? 'LESS_EQUAL' : 'LESS'); break;
            case '>': this.addToken(this.match('=') ? 'GREATER_EQUAL' : 'GREATER'); break;
            case '/':
                if (this.match('/')) {
                    while(this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance()
                    }
                }
                else {
                    this.addToken('SLASH')
                }
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++
                break;
            case '"': this.string(); break;
            default:
                if (this.isDigit(c)) {
                    this.number()
                }
                else if (this.isAlpha(c)) {
                    this.identifier()
                }
                else {
                    Lox.error(this.line, 'Unexpected character.')
                }
                break;
        }
    }

    private isAlpha(c: string) {
        return (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
         c == '_';
    }

    private isAlphaNumeric(c: string) {
        return this.isDigit(c) || this.isAlpha(c)
    }

    private identifier() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance()
        }
        const text = this.source.substring(this.start, this.current)
        let type = Scanner.keywords[text]
        if (!type) {
            type = 'IDENTIFIER'
        }
        this.addToken(type)
    }

    private isDigit(c: string) {
        return c >= '0' && c <= '9';
    }

    private number() {
        while (this.isDigit(this.peek())) {
            this.advance()
        }

        if (this.peek() === '.' && this.isDigit(this.peek(1))) {
            this.advance()

            while (this.isDigit(this.peek())) {
                this.advance()
            }
        }

        this.addToken('NUMBER', parseFloat(this.source.substring(this.start, this.current)))
    }

    private string() {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++
            }
            this.advance()
        }

        if (this.isAtEnd()) {
            Lox.error(this.line, 'Unterminated string.')
            return
        }

        this.advance()

        const value = this.source.substring(this.start + 1, this.current - 1)
        this.addToken('STRING', value)
    }

    private peek(n: 0 | 1 = 0) {
        if (this.current + n >= this.source.length) {
            return '\0'
        }
        return this.source[this.current + n]
    }

    private match(expected: string) {
        if (this.isAtEnd()) {
            return false
        }
        if (this.source[this.current] !== expected) {
            return false
        }
        this.current++
        return true
    }

    private advance() {
        this.current++
        return this.source[this.current - 1]
    }

    private addToken(token: TokenType, literal?: any) {
        const text = this.source.substring(this.start, this.current)
        this.tokens.push(new Token(token, text, literal, this.line))
    }

    scanTokens() {
        while(!this.isAtEnd()) {
            this.start = this.current
            this.scanToken()
        }

        this.tokens.push(new Token('EOF', "", undefined, this.line))
        return this.tokens
    }
}