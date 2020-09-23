import { Token } from "./Token";
export declare class Scanner {
    private reportError;
    private source;
    private tokens;
    private start;
    private current;
    private line;
    constructor(source: string, reportError: (line: number, message: string) => void);
    private static keywords;
    private isAtEnd;
    private scanToken;
    private isAlpha;
    private isAlphaNumeric;
    private identifier;
    private isDigit;
    private number;
    private string;
    private peek;
    private match;
    private advance;
    private addToken;
    scanTokens(): Token[];
}
