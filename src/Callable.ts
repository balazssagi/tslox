import { Environment } from "./Environment";
import { Interpreter, Value } from "./Interpreter";
import { Return } from "./Return";
import { FunctionStmt } from "./Stmt";

export abstract class Callable {
    abstract call(interpreter: Interpreter, args: Value[]): Value
    abstract arity(): number
}

export class LoxFunction extends Callable {
    constructor(private declaration: FunctionStmt, private closure: Environment) {
        super()
    }

    call(interpreter: Interpreter, args: Value[]): Value {
        const environment = new Environment(interpreter.globals)
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i])
        }
        
        try {
            interpreter.executeBlock(this.declaration.body, this.closure)
        }
        catch(e) {
            if (e instanceof Return) {
                return e.value
            }
            throw(e)
        }
        return null
    }

    arity() {
        return this.declaration.params.length
    }

    toString() {
        return `fn <${this.declaration.name.lexeme}>`
    }
}

export class NativeFunction extends Callable {
    constructor(private _arity: number, private _call: (...args: any) => any) {
        super()
    }

    call(_: Interpreter, args: Value[]) {
        return this._call(...args)
    }

    arity() {
        return this._arity
    }

    toString() {
        return '<native fn>'
    }
}