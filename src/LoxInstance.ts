import { LoxClass } from "./Callable";
import { RuntimeError, Value } from "./Interpreter";
import { Token } from "./Token";

export class LoxInstance {
    private fields = new Map<string, Value>()

    constructor(private loxClass: LoxClass) {}

    get(name: Token): Value {
        if (this.fields.has(name.lexeme)) {
            return this.fields.get(name.lexeme)!
        }

        const method = this.loxClass.findMethod(name.lexeme)
        if (method !== undefined) {
            return method.bind(this)
        }

        throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`)
    }

    set(name: Token, value: Value) {
        this.fields.set(name.lexeme, value)!
    }

    toString() {
        return `${this.loxClass} instance`
    }
}