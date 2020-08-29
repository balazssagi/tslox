import { Token } from "./Token"

interface ExprVisitor<T> {
    visitUnaryExpr(expr: UnaryExpr): T
}

class Logger implements ExprVisitor<string> {
    visitUnaryExpr(expr: UnaryExpr) {
        return 'asd'
    }
    print(expr: Expr) {
        return expr.accept(this)
    }
}

const a = new Logger()


abstract class Expr {
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
}

export class GroupingExpr extends Expr {
    constructor(public expression: Expr) {
        super()
    }
}

export class LiteralExpr extends Expr {
    constructor(public value: object) {
        super()
    }
}

const u = new UnaryExpr(new Token('IDENTIFIER', '', 1, 5), new LiteralExpr({}))
u.accept(a)