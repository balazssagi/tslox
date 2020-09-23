import { Token } from "./Token";
export interface ExprVisitor<T> {
    visitUnaryExpr(expr: UnaryExpr): T;
    visitBinaryExpr(expr: BinaryExpr): T;
    visitGroupingExpr(expr: GroupingExpr): T;
    visitLiteralExpr(expr: LiteralExpr): T;
    visitVariableExpr(expr: VariableExpr): T;
    visitAssignExpr(expr: AssignExpr): T;
    visitLogicalExpr(expr: LogicalExpr): T;
    visitCallExpr(expr: CallExpr): T;
    visitGetExpr(expr: GetExpr): T;
    visitSetExpr(expr: SetExpr): T;
    visitThisExpr(expr: ThisExpr): T;
    visitSuperExpr(expr: SuperExpr): T;
}
export declare abstract class Expr {
    abstract accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class UnaryExpr extends Expr {
    operator: Token;
    right: Expr;
    constructor(operator: Token, right: Expr);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class BinaryExpr extends Expr {
    left: Expr;
    operator: Token;
    right: Expr;
    constructor(left: Expr, operator: Token, right: Expr);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class GroupingExpr extends Expr {
    expression: Expr;
    constructor(expression: Expr);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class LiteralExpr extends Expr {
    value: boolean | number | string | null;
    constructor(value: boolean | number | string | null);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class VariableExpr extends Expr {
    name: Token;
    constructor(name: Token);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class AssignExpr extends Expr {
    name: Token;
    value: Expr;
    constructor(name: Token, value: Expr);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class LogicalExpr extends Expr {
    left: Expr;
    operator: Token;
    right: Expr;
    constructor(left: Expr, operator: Token, right: Expr);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class CallExpr extends Expr {
    callee: Expr;
    token: Token;
    args: Expr[];
    constructor(callee: Expr, token: Token, args: Expr[]);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class GetExpr extends Expr {
    object: Expr;
    name: Token;
    constructor(object: Expr, name: Token);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class SetExpr extends Expr {
    object: Expr;
    name: Token;
    value: Expr;
    constructor(object: Expr, name: Token, value: Expr);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class ThisExpr extends Expr {
    keyword: Token;
    constructor(keyword: Token);
    accept<T>(visitor: ExprVisitor<T>): T;
}
export declare class SuperExpr extends Expr {
    keyword: Token;
    method: Token;
    constructor(keyword: Token, method: Token);
    accept<T>(visitor: ExprVisitor<T>): T;
}
