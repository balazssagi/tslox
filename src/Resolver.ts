import { ExprVisitor, Expr, VariableExpr, AssignExpr, BinaryExpr, CallExpr, GroupingExpr, LiteralExpr, UnaryExpr, LogicalExpr } from "./Expr";
import { Interpreter } from "./Interpreter";
import { Lox } from "./Lox";
import { BlockStmt, FunctionStmt, Stmt, StmtVisitor, VarStmt, ExpressionStmt, IfStmt, PrintStmt, ReturnStmt, WhileStmt } from "./Stmt";
import { Token } from "./Token";

export class Resolver implements StmtVisitor<void>, ExprVisitor<void> {
    private scopes: Map<string, boolean>[] = []
    
    constructor(private interpreter: Interpreter) {}
    

    visitBlockStmt(stmt: BlockStmt) {
        this.beginScope()
        this.resolveStatements(stmt.statements)
        this.endScope()
    }

    visitVarStmt(stmt: VarStmt) {
        this.declare(stmt.name)
        if (stmt.initializer !== undefined) {
            this.resolveExpression(stmt.initializer)
        }
        this.define(stmt.name)
    }

    visitVariableExpr(expr: VariableExpr) {
        if (this.scopes.length !== 0 && this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false) {
            Lox.error(expr.name.line, "Cannot read local variable in its own initializer.")
        }
        this.resolveLocal(expr, expr.name)
    }

    visitAssignExpr(expr: AssignExpr) {
        this.resolveExpression(expr.value)
        this.resolveLocal(expr, expr.name)
    }

    visitFunctionStmt(stmt: FunctionStmt) {
        this.declare(stmt.name)
        this.define(stmt.name)

        this.resolveFunction(stmt)
    }

    visitExpressionStmt(stmt: ExpressionStmt) {
        this.resolveExpression(stmt.expression)
    }

    visitIfStmt(stmt: IfStmt) {
        this.resolveExpression(stmt.condition)
        this.resolveStatement(stmt.thenBranch)
        if (stmt.elseBranch !== undefined) {
            this.resolveStatement(stmt.elseBranch)
        }
    }

    visitPrintStmt(stmt: PrintStmt) {
        this.resolveExpression(stmt.expression)
    }

    visitReturnStmt(stmt: ReturnStmt) {
        if (stmt.value !== undefined) {
            this.resolveExpression(stmt.value)
        }
    }

    visitWhileStmt(stmt: WhileStmt) {
        this.resolveExpression(stmt.condition)
        this.resolveStatement(stmt.body)
    }

    visitBinaryExpr(expr: BinaryExpr) {
        this.resolveExpression(expr.left)
        this.resolveExpression(expr.right)
    }

    visitCallExpr(expr: CallExpr) {
        this.resolveExpression(expr.callee)

        for (const arg of expr.args) {
            this.resolveExpression(arg)
        }
    }

    visitGroupingExpr(expr: GroupingExpr) {
        this.resolveExpression(expr.expression)
    }

    visitLiteralExpr(expr: LiteralExpr) {

    }

    visitLogicalExpr(expr: LogicalExpr) {
        this.resolveExpression(expr.left)
        this.resolveExpression(expr.right)
    }

    visitUnaryExpr(expr: UnaryExpr) {
        this.resolveExpression(expr.right)
    }

    private resolveFunction(stmt: FunctionStmt) {
        this.beginScope()
        for (const param of stmt.params) {
            this.declare(param)
            this.define(param)
        }
        this.resolveStatements(stmt.body)
        this.endScope()
    }

    public resolveStatements(stmts: Stmt[]) {
        for (const stmt of stmts) {
            this.resolveStatement(stmt)
        }
    }

    private declare(name: Token) {
        if (this.scopes.length === 0) {
            return
        }
        const scope = this.scopes[this.scopes.length - 1]
        scope.set(name.lexeme, false)
    }

    private define(name: Token) {
        if (this.scopes.length === 0) {
            return
        }
        const scope = this.scopes[this.scopes.length - 1]
        scope.set(name.lexeme, true)
    }

    private resolveStatement(stmt: Stmt) {
        stmt.accept(this)
    }

    private resolveExpression(expr: Expr) {
        expr.accept(this)
    }

    private resolveLocal(expr: Expr, name: Token) {
        for (let i = 0; i < this.scopes.length; i++) {
            const scope = this.scopes[i]
            if (scope.has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i)
                return
            }
        }
    }

    private beginScope() {
        this.scopes.push(new Map<string, boolean>())
    }

    private endScope() {
        this.scopes.pop()
    }
} 