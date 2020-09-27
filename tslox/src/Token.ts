import { TokenType } from "./TokenType";

export type TokenRange = [start: number, end: number]

export class Token {
    constructor(
        public type: TokenType,
        public lexeme: string,
        public literal: any,
        public range: TokenRange,
    ) {}

    toString() {
        return `${this.type} ${this.lexeme}, ${this.literal}`;
    }
}