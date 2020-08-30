import { BinaryExpr, Expr, ExprVisitor, GroupingExpr, LiteralExpr, UnaryExpr } from "./Expr";
import { Lox } from "./Lox";
import { Token } from "./Token";

type Value = boolean | number | string | null

export class Interpreter implements ExprVisitor<Value> {
    visitLiteralExpr(expr: LiteralExpr): Value {
        return expr.value
    }

    visitGroupingExpr(expr: GroupingExpr): Value {
        return this.evaulate(expr.expression)
    }

    visitBinaryExpr(expr: BinaryExpr): Value {
        const left = this.evaulate(expr.left)
        const right = this.evaulate(expr.right)

        switch (expr.operator.type) {
            case 'MINUS':
                this.checkNumberOperand(expr.operator, left)
                this.checkNumberOperand(expr.operator, right)
                return left - right
            case 'SLASH':
                this.checkNumberOperand(expr.operator, left)
                this.checkNumberOperand(expr.operator, right)
                if (right === 0) {
                    throw new RuntimeError(expr.operator, 'Division by zero is not allowed.')
                }
                return left / right
            case 'STAR':
                this.checkNumberOperand(expr.operator, left)
                this.checkNumberOperand(expr.operator, right)
                return left * right
            case 'PLUS':
                if (typeof left === 'string' && typeof right === 'string') {
                    return left + right
                }
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.")
            case 'GREATER':
                this.checkNumberOperand(expr.operator, left)
                this.checkNumberOperand(expr.operator, right)
                return left > right
            case 'GREATER_EQUAL':
                this.checkNumberOperand(expr.operator, left)
                this.checkNumberOperand(expr.operator, right)
                return left >= right
            case 'LESS':
                this.checkNumberOperand(expr.operator, left)
                this.checkNumberOperand(expr.operator, right)
                return left <= right
            case 'LESS_EQUAL':
                this.checkNumberOperand(expr.operator, left)
                this.checkNumberOperand(expr.operator, right)
                return left <= right
            case 'BANG_EQUAL':
                return !this.isEqual(left, right)
            case 'EQUAL_EQUAL':
                return this.isEqual(left, right)
        }

        // ???
        throw new Error()
    }

    visitUnaryExpr(expr: UnaryExpr): Value {
        const right = this.evaulate(expr.right)
        switch (expr.operator.type) {
            case 'MINUS':
                this.checkNumberOperand(expr.operator, right)
                return -right
            case 'BANG':
                return !this.isTruthy(right)
        }

        // ???
        throw new Error()
    }

    interpret(expr: Expr) {
        try {
            const value = this.evaulate(expr)
            console.log(this.stringify(value))
        }
        catch(e) {
            Lox.runtimeError(e)
        }
    }

    private stringify(value: Value) {
        if (value === null) {
            return 'nil'
        }

        return value.toString()
    }

    private checkNumberOperand(operator: Token, operand: Value): asserts operand is number {
        if (typeof operand === 'number') {
            return
        }
        throw new RuntimeError(operator, 'Operand must be a number.')
    }

    private isEqual(left: Value, right: Value) {
        return Object.is(left, right)
    }

    private isTruthy(value: Value) {
        if (value === null || value === false) {
            return false
        }
        return true
    }

    private evaulate(expr: Expr) {
        return expr.accept(this)
    }
}

export class RuntimeError extends Error {
    token

    constructor(token: Token, message: string) {
        super(message)
        this.token = token
    }
}