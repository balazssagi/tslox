import { Environment } from "./Environment";
import { Interpreter, Value } from "./Interpreter";
import { LoxInstance } from "./LoxInstance";
import { FunctionStmt } from "./Stmt";
export declare abstract class Callable {
    abstract call(interpreter: Interpreter, args: Value[]): any;
    abstract arity(): number;
}
export declare class LoxFunction extends Callable {
    private declaration;
    private closure;
    private isInitiazlier;
    constructor(declaration: FunctionStmt, closure: Environment, isInitiazlier: boolean);
    call(interpreter: Interpreter, args: Value[]): Value;
    arity(): number;
    bind(instance: LoxInstance): LoxFunction;
    toString(): string;
}
export declare class NativeFunction extends Callable {
    private _arity;
    private _call;
    constructor(_arity: number, _call: (...args: any) => any);
    call(_: Interpreter, args: Value[]): any;
    arity(): number;
    toString(): string;
}
export declare class LoxClass extends Callable {
    private name;
    private superClass;
    private methods;
    constructor(name: string, superClass: LoxClass | undefined, methods: Map<string, LoxFunction>);
    call(interpreter: Interpreter, args: Value[]): LoxInstance;
    arity(): number;
    findMethod(name: string): LoxFunction | undefined;
    toString(): string;
}
