import { BinaryExpr, ExprVisitor, GroupingExpr, LiteralExpr, UnaryExpr } from "./Expr";

export class Interpreter implements ExprVisitor<boolean | number | string | null> {
    visitLiteralExpr(expr: LiteralExpr) {
        return expr.value
    }
    visitBinaryExpr(expr: BinaryExpr) {
        return {}
    }
    visitGroupingExpr(expr: GroupingExpr) {
        return expr.expression.accept(this)
    }
    visitUnaryExpr(expr: UnaryExpr) {
        return {}
    }
}