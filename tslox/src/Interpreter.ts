import { Environment } from "./Environment";
import { AssignExpr, BinaryExpr, CallExpr, Expr, ExprVisitor, GetExpr, GroupingExpr, LiteralExpr, LogicalExpr, SetExpr, SuperExpr, ThisExpr, UnaryExpr, VariableExpr } from "./Expr";
import { BlockStmt, ClassStmt, ExpressionStmt, FunctionStmt, IfStmt, PrintStmt, ReturnStmt, Stmt, StmtVisitor, VarStmt, WhileStmt } from "./Stmt";
import { Token } from "./Token";
import { Callable, LoxFunction, LoxClass } from './Callable'
import { globals } from "./globals";
import { Return } from "./Return";
import { LoxInstance } from "./LoxInstance";

export type Value = boolean | number | string | null | Callable | LoxInstance

export class Interpreter implements ExprVisitor<Value>, StmtVisitor<void> {
    public globals = new Environment()
    private environment = this.globals
    private locals = new Map<Expr, number>()

    constructor(private stdout: (value: string) => void, private reportRuntimeError: (e: RuntimeError) => void) {
        for (const [name, loxFunction] of Object.entries(globals)) {
            this.environment.define(name, loxFunction);
        }
    }

    visitFunctionStmt(stmt: FunctionStmt) {
        const fn = new LoxFunction(stmt, this.environment, false)
        this.environment.define(stmt.name.lexeme, fn)
    }

    visitVarStmt(stmt: VarStmt) {
        let value: Value = null
        if (stmt.initializer !== undefined) {
            value = this.evaulate(stmt.initializer)
        }
        this.environment.define(stmt.name.lexeme, value)
    }

    visitClassStmt(stmt: ClassStmt) {
        let superclass: undefined | LoxClass
        if (stmt.superclass !== undefined) {
            const value = this.evaulate(stmt.superclass)
            if (!(value instanceof LoxClass)) {
                throw new RuntimeError(stmt.superclass.name, "Superclass must be a class.");
            }
            superclass = value
        }

        this.environment.define(stmt.name.lexeme, null)

        if (superclass !== undefined) {
            this.environment = new Environment(this.environment)
            this.environment.define("super", superclass)
        }

        const methods = new Map<string, LoxFunction>()
        for (const method of stmt.methods) {
             const fn = new LoxFunction(method, this.environment, method.name.lexeme === 'init')
             methods.set(method.name.lexeme, fn)
        }

        const loxClass = new LoxClass(stmt.name.lexeme, superclass, methods)

        if (superclass !== undefined) {
            this.environment = this.environment.enclosing!
        }

        this.environment.assign(stmt.name, loxClass)
    }

    visitExpressionStmt(stmt: ExpressionStmt) {
        this.evaulate(stmt.expression)
    }

    visitPrintStmt(stmt: PrintStmt) {
        const value = this.evaulate(stmt.expression)
        this.stdout(this.stringify(value))
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

    visitReturnStmt(stmt: ReturnStmt) {
        let value: Value = null
        if (stmt.value) {
            value = this.evaulate(stmt.value)
        }

        throw new Return(value)
        
    }

    visitBlockStmt(stmt: BlockStmt) {
        this.executeBlock(stmt.statements, new Environment(this.environment))
    }

    visitVariableExpr(expr: VariableExpr): Value {
        const value = this.lookUpVariable(expr.name, expr)
        if (value === undefined) {
            // ???
            throw new RuntimeError(expr.name, `Failed to find variable: ${expr.name.lexeme}`)
        }
        return value
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

    visitGetExpr(expr: GetExpr): Value {
        const object = this.evaulate(expr.object)
        if (object instanceof LoxInstance) {
            return object.get(expr.name)
        }
        throw new RuntimeError(expr.name, "Only instances have properties.")
    }

    visitSetExpr(expr: SetExpr): Value {
        const object = this.evaulate(expr.object)
        if (!(object instanceof LoxInstance)) {
            throw new RuntimeError(expr.name, "Only instances have fields.")
        }

        const value = this.evaulate(expr.value)
        object.set(expr.name, value)
        return value
    }

    visitThisExpr(expr: ThisExpr): Value {
        const value = this.lookUpVariable(expr.keyword, expr)
        if (value === undefined) {
            // ???
            throw new RuntimeError(expr.keyword, '')
        }
        return value
    }

    visitSuperExpr(expr: SuperExpr): Value {
        const distance = this.locals.get(expr)!
        const superclass = this.environment.getAt(distance, "super") as LoxClass
        const object = this.environment.getAt(distance - 1, "this") as LoxInstance
        const method = superclass.findMethod(expr.method.lexeme)

        if (method === undefined) {
            throw new RuntimeError(expr.keyword, `Undefined property '${expr.method.lexeme}'.`)
        }

        return method.bind(object)
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
                return left < right
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
                this.checkNumberOperand(expr.operator, right, true)
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

        const distance = this.locals.get(expr)
        if (distance !== undefined) {
            this.environment.assignAt(distance, expr.name, value)
        }
        else {
            this.globals.assign(expr.name, value)
        }

        return value
    }

    interpret(statements: Stmt[]) {
        try {
            for (const statement of statements) {
                this.execute(statement)                
            }
        }
        catch(e) {
            if (e instanceof RuntimeError) {
                this.reportRuntimeError(e)
            }
        }
    }

    resolve(expr: Expr, depth: number) {
        this.locals.set(expr, depth)
    }

    lookUpVariable(name: Token, expr: Expr) {
        const distance = this.locals.get(expr)
        if (distance !== undefined) {
            return this.environment.getAt(distance, name.lexeme)
        }
        return this.globals.get(name)
    }

    private stringify(value: Value) {
        if (value === null) {
            return 'nil'
        }
        if (Object.is(value, -0)) {
            return '-0'
        }

        return value.toString()
    }

    private checkNumberOperand(operator: Token, operand: Value, unary = false): asserts operand is number {
        if (typeof operand === 'number') {
            return
        }
        throw new RuntimeError(operator, unary ? 'Operand must be a number.' : 'Operands must be numbers.')
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

    public executeBlock(statements: Stmt[], environment: Environment) {
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
        Object.setPrototypeOf(this, RuntimeError.prototype);
    }
}