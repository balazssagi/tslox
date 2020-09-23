import { TokenType } from "./TokenType";
export declare class Token {
    type: TokenType;
    lexeme: string;
    literal: any;
    line: number;
    constructor(type: TokenType, lexeme: string, literal: any, line: number);
    toString(): string;
}
