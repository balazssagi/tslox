import { LoxClass } from "./Callable";
import { Value } from "./Interpreter";
import { Token } from "./Token";
export declare class LoxInstance {
    private loxClass;
    private fields;
    constructor(loxClass: LoxClass);
    get(name: Token): Value;
    set(name: Token, value: Value): void;
    toString(): string;
}
