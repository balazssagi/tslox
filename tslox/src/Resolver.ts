import { ExprVisitor, Expr, VariableExpr, AssignExpr, BinaryExpr, CallExpr, GroupingExpr, LiteralExpr, UnaryExpr, LogicalExpr, GetExpr, SetExpr, ThisExpr, SuperExpr } from "./Expr";
import { Interpreter } from "./Interpreter";
import { Lox } from "./Lox";
import { BlockStmt, FunctionStmt, Stmt, StmtVisitor, VarStmt, ExpressionStmt, IfStmt, PrintStmt, ReturnStmt, WhileStmt, ClassStmt } from "./Stmt";
import { Token } from "./Token";

type FunctionType = 'none' | 'function' | 'method' | 'initializer'
type ClassType = 'none' | 'class' | 'subclass'

export class Resolver implements StmtVisitor<void>, ExprVisitor<void> {
    private scopes: Map<string, boolean>[] = []
    private currentFunction: FunctionType = 'none'
    private currentClass: ClassType = 'none'
    
    constructor(private interpreter: Interpreter, private reportError: (token: Token, message: string) => void) {}
    

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

    visitClassStmt(stmt: ClassStmt) {
        const enclosingClassType = this.currentClass
        this.currentClass = 'class'
        this.declare(stmt.name)
        this.define(stmt.name)

        if (stmt.superclass !== undefined) {
            this.currentClass = 'subclass'
            if (stmt.name.lexeme === stmt.superclass.name.lexeme) {
                this.reportError(stmt.name, "A class cannot inherit from itself.")
            }

            this.resolveExpression(stmt.superclass)

            this.beginScope()
            this.scopes[this.scopes.length - 1].set('super', true)
        }

        this.beginScope()
        this.scopes[this.scopes.length - 1].set('this', true)

        for (const method of stmt.methods) {
            let declaration: FunctionType = 'method'
            if (method.name.lexeme === 'init') {
                declaration = 'initializer'
            }
            this.resolveFunction(method, declaration)
        }

        this.endScope()

        if (stmt.superclass !== undefined) {
            this.endScope()
        }

        this.currentClass = enclosingClassType
    }

    visitVariableExpr(expr: VariableExpr) {
        if (this.scopes.length !== 0 && this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false) {
            this.reportError(expr.name, "Cannot read local variable in its own initializer.")
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

        this.resolveFunction(stmt, 'function')
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
        if (this.currentFunction === 'none') {
            this.reportError(stmt.keyword, "Cannot return from top-level code.")
        }
        if (stmt.value !== undefined) {
            if (this.currentFunction === 'initializer') {
                this.reportError(stmt.keyword, "Cannot return a value from an initializer.")
            }
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

    visitGetExpr(expr: GetExpr) {
        this.resolveExpression(expr.object)
    }

    visitSetExpr(expr: SetExpr) {
        this.resolveExpression(expr.value)
        this.resolveExpression(expr.object)
    }

    visitThisExpr(expr: ThisExpr) {
        if (this.currentClass === 'none') {
            this.reportError(expr.keyword, "Cannot use 'this' outside of a class.")
        }

        this.resolveLocal(expr, expr.keyword)
    }

    visitSuperExpr(expr: SuperExpr) {
        if (this.currentClass == "none") {
            this.reportError(expr.keyword, "Cannot use 'super' outside of a class.");
        } else if (this.currentClass != "subclass") {
            this.reportError(expr.keyword, "Cannot use 'super' in a class with no superclass.");
        }
      
        this.resolveLocal(expr, expr.keyword)
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

    private resolveFunction(stmt: FunctionStmt, type: FunctionType) {
        const enclosingFunction = this.currentFunction
        this.currentFunction = type
        
        this.beginScope()
        for (const param of stmt.params) {
            this.declare(param)
            this.define(param)
        }
        this.resolveStatements(stmt.body)
        this.endScope()
        this.currentFunction = enclosingFunction
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
        if (scope.has(name.lexeme)) {
            this.reportError(name, "Variable with this name already declared in this scope.")
        }
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