import { Stmt } from "./Stmt";
declare type ErrorReporter = (input: {
    line: number;
    message: string;
    formattedMessage: string;
}) => void;
declare type Options = {
    stdOut?: (message: string) => void;
    errorReporter?: ErrorReporter;
};
export declare class Lox {
    private hasError;
    private stdOut;
    private errorReporter;
    private interpreter;
    constructor(options?: Options);
    parse(source: string): Stmt[] | null;
    run(statements: Stmt[]): void;
    private reset;
    private reportRuntimeError;
    private reportError;
    private reportScannerError;
}
export {};
