import { Interpreter, Value } from "./Interpreter";

type Call = (interpreter: Interpreter, args: Value[]) => Value

export abstract class Callable {
    constructor(public call: Call, public arity: () => number) {}
}

export class LoxFunction extends Callable {

}