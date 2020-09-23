import { Value } from './Interpreter';
import { Token } from './Token';
export declare class Environment {
    enclosing?: Environment | undefined;
    private values;
    constructor(enclosing?: Environment | undefined);
    define(name: string, value: Value): void;
    assign(name: Token, value: Value): void;
    get(name: Token): Value;
    getAt(distance: number, name: string): string | number | boolean | import("./Callable").Callable | import("./LoxInstance").LoxInstance | null | undefined;
    assignAt(distance: number, name: Token, value: Value): Map<string, Value>;
    private ancestor;
}
