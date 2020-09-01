import { Value } from "./Interpreter"
import { Token } from "./Token"

export interface ExprVisitor<T> {
    visitUnaryExpr(expr: UnaryExpr): T
    visitBinaryExpr(expr: BinaryExpr): T
    visitGroupingExpr(expr: GroupingExpr): T
    visitLiteralExpr(expr: LiteralExpr): T
    visitVariableExpr(expr: VariableExpr): T
    visitAssignExpr(expr: AssignExpr): T
    visitLogicalExpr(expr: LogicalExpr): T
    visitCallExpr(expr: CallExpr): T
}

export abstract class Expr {
    abstract accept<T>(visitor: ExprVisitor<T>): T
}

export class UnaryExpr extends Expr {
    constructor(public operator: Token, public right: Expr) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitUnaryExpr(this)
    }
}


export class BinaryExpr extends Expr {
    constructor(public left: Expr, public operator: Token, public right: Expr) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitBinaryExpr(this)
    }
}

export class GroupingExpr extends Expr {
    constructor(public expression: Expr) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitGroupingExpr(this)
    }
}

export class LiteralExpr extends Expr {
    constructor(public value: boolean | number | string | null) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitLiteralExpr(this)
    }
}

export class VariableExpr extends Expr {
    constructor(public name: Token) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitVariableExpr(this)
    }
}

export class AssignExpr extends Expr {
    constructor(public name: Token, public value: Expr) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitAssignExpr(this)
    }
}

export class LogicalExpr extends Expr {
    constructor(public left: Expr, public operator: Token, public right: Expr) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitLogicalExpr(this)
    }
}

export class CallExpr extends Expr {
    constructor(public callee: Expr, public token: Token, public args: Expr[]) {
        super()
    }
    accept<T>(visitor: ExprVisitor<T>) {
        return visitor.visitCallExpr(this)
    }
}