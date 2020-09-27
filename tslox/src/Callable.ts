import { inherits } from "util";
import { Environment } from "./Environment";
import { Interpreter, Value } from "./Interpreter";
import { LoxInstance } from "./LoxInstance";
import { Return } from "./Return";
import { FunctionStmt } from "./Stmt";

export abstract class Callable {
    // types ???
    abstract call(interpreter: Interpreter, args: Value[]): any
    abstract arity(): number
}

export class LoxFunction extends Callable {
    constructor(private declaration: FunctionStmt, private closure: Environment, private isInitiazlier: boolean) {
        super()
    }
    
    call(interpreter: Interpreter, args: Value[]): Value {
        const environment = new Environment(this.closure)
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i])
        }
        
        try {
            interpreter.executeBlock(this.declaration.body, environment)
        }
        catch(e) {
            if (e instanceof Return) {
                if (this.isInitiazlier) {
                    return this.closure.getAt(0, "this")!
                }
                return e.value
            }
            throw(e)
        }
        if (this.isInitiazlier) {
            return this.closure.getAt(0, "this")!
        }
        return null
    }

    arity() {
        return this.declaration.params.length
    }

    bind(instance: LoxInstance) {
        const envivornment = new Environment(this.closure)
        envivornment.define('this', instance)
        return new LoxFunction(this.declaration, envivornment, this.isInitiazlier)
    }

    toString() {
        return `<fn ${this.declaration.name.lexeme}>`
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

export class LoxClass extends Callable {
    constructor(private name: string, private superClass: LoxClass | undefined, private methods: Map<string, LoxFunction>) {
        super()
    }

    call(interpreter: Interpreter, args: Value[]) {
        const instance = new LoxInstance(this)

        const initializer = this.findMethod('init')
        if (initializer !== undefined) {
            initializer.bind(instance).call(interpreter, args)
        }

        return instance
    }

    arity() {
        const initializer = this.findMethod('init')
        if (initializer !== undefined) {
            return initializer.arity()
        }
        return 0
    }

    findMethod(name: string): LoxFunction | undefined {
        if (this.methods.has(name)) {
            return this.methods.get(name)
        }
        return this.superClass?.findMethod(name)
    }

    toString() {
        return this.name
    }
}