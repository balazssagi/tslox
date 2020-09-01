import { Environment } from "./Environment";
import { AssignExpr, BinaryExpr, CallExpr, Expr, ExprVisitor, GroupingExpr, LiteralExpr, LogicalExpr, UnaryExpr, VariableExpr } from "./Expr";
import { Lox } from "./Lox";
import { BlockStmt, ExpressionStmt, IfStmt, PrintStmt, Stmt, StmtVisitor, VarStmt, WhileStmt } from "./Stmt";
import { Token } from "./Token";
import { Callable } from './Callable'
import { globals } from "./globals";

export type Value = boolean | number | string | null | Callable

export class Interpreter implements ExprVisitor<Value>, StmtVisitor<void> {
    private globals = new Environment()
    private environment = this.globals

    constructor() {
        for (const [name, loxFunction] of Object.entries(globals)) {
            this.environment.define(name, loxFunction);
        }
    }


    visitVarStmt(stmt: VarStmt) {
        let value: Value = null
        if (stmt.initializer !== undefined) {
            value = this.evaulate(stmt.initializer)
        }
        this.environment.define(stmt.name.lexeme, value)
    }

    visitExpressionStmt(stmt: ExpressionStmt) {
        this.evaulate(stmt.expression)
    }

    visitPrintStmt(stmt: PrintStmt) {
        
        const value = this.evaulate(stmt.expression)
        console.log(this.stringify(value))
    }
    
    visitIfStmt(stmt: IfStmt) {
        if (this.isTruthy(this.evaulate(stmt.condition))) {
            this.execute(stmt.thenBranch)
        }
        else if (stmt.elseBranch) {
            this.execute(stmt.elseBranch)
        }
    }

    visitWhileStmt(stmt: WhileStmt) {
        while (this.evaulate(stmt.condition)) {
            this.execute(stmt.body)
        }
    }

    visitBlockStmt(stmt: BlockStmt) {
        this.executeBlock(stmt.statements, new Environment(this.environment))
    }

    visitVariableExpr(expr: VariableExpr): Value {
        return this.environment.get(expr.name)
    }

    visitLiteralExpr(expr: LiteralExpr): Value {
        return expr.value
    }

    visitGroupingExpr(expr: GroupingExpr): Value {
        return this.evaulate(expr.expression)
    }

    visitCallExpr(expr: CallExpr): Value {
        const callee = this.evaulate(expr.callee)
        const args = expr.args.map(arg => this.evaulate(arg))

        if (!(callee instanceof Callable)) {
            throw new RuntimeError(expr.token, "Can only call functions and classes.")
        }

        if (args.length !== callee.arity()) {
            throw new RuntimeError(
                expr.token,
                "Expected " + callee.arity() + " arguments but got " + args.length + "."
            );
        }

        return callee.call(this, args)     
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

    visitLogicalExpr(expr: LogicalExpr): Value {
        const left = this.evaulate(expr.left);

        if (expr.operator.type == 'OR') {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }

        return this.evaulate(expr.right)
    }

    visitAssignExpr(expr: AssignExpr): Value {
        const value = this.evaulate(expr.value)

        this.environment.assign(expr.name, value)
        return value
    }

    interpret(statements: Stmt[]) {
        try {
            for (const statement of statements) {
                this.execute(statement)                
            }
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

    private execute(stmt: Stmt) {
        return stmt.accept(this)
    }

    private executeBlock(statements: Stmt[], environment: Environment) {
        const prevEnvironment = this.environment
        try {
            this.environment = environment
            for (const statement of statements) {
                this.execute(statement)
            }
        }
        finally {
            this.environment = prevEnvironment
        }
    }
}

export class RuntimeError extends Error {
    token

    constructor(token: Token, message: string) {
        super(message)
        this.token = token
    }
}