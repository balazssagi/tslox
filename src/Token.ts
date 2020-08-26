import { TokenType } from "./TokenType";

export class Token {
    type
    lexeme
    literal
    line

    constructor(type: TokenType, lexeme: string, literal: object, line: number) {
        this.type = type
        this.lexeme = lexeme
        this.literal = literal
        this.line = line
    }

    toString() {
        return `${this.type} ${this.lexeme}, ${this.literal}`
    }
}