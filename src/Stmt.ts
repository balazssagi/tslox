import { Expr } from "./Expr"
import { Token } from "./Token"

export interface StmtVisitor<T> {
    visitExpressionStmt(stmt: ExpressionStmt): T
    visitPrintStmt(stmt: PrintStmt): T
    visitVarStmt(stmt: VarStmt): T
    visitBlockStmt(stmt: BlockStmt): T
}

export abstract class Stmt {
    abstract accept<T>(visitor: StmtVisitor<T>): T
}

export class ExpressionStmt extends Stmt {

    constructor(public expression: Expr) {
        super()
    }

    accept<T>(visitor: StmtVisitor<T>) {
        return visitor.visitExpressionStmt(this)
    }
}

export class PrintStmt extends Stmt {

    constructor(public expression: Expr) {
        super()
    }

    accept<T>(visitor: StmtVisitor<T>) {
        return visitor.visitPrintStmt(this)
    }
}

export class VarStmt extends Stmt {

    constructor(public name: Token, public initializer?: Expr) {
        super()
    }

    accept<T>(visitor: StmtVisitor<T>) {
        return visitor.visitVarStmt(this)
    }
}

export class BlockStmt extends Stmt {

    constructor(public statements: Stmt[]) {
        super()
    }

    accept<T>(visitor: StmtVisitor<T>) {
        return visitor.visitBlockStmt(this)
    }
}