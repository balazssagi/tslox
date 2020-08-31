import { RuntimeError, Value } from './Interpreter'
import { Token } from './Token'
 
export class Environment {
    private values = new Map<string, Value>()
    
    constructor(private enclosing?: Environment) {}

    public define(name: string, value: Value) {
        this.values.set(name, value)
    }

    public assign(name: Token, value: Value) {
        if (!this.values.has(name.lexeme)) {
            if (this.enclosing) {
                this.enclosing.assign(name, value)
                return
            }
            throw new RuntimeError(name, `Undefined variable: ${name.lexeme}.`)
        }
        this.values.set(name.lexeme, value)
    }

    public get(name: Token): Value {
        const value = this.values.get(name.lexeme)
        if (value !== undefined) {
            return value
        }

        if (this.enclosing) {
            return this.enclosing.get(name)
        }

        throw new RuntimeError(name, `Undefined variable: ${name.lexeme}.`)
    }

}