import { Expr, VariableExpr } from "./Expr";
import { Token } from "./Token";
export interface StmtVisitor<T> {
    visitExpressionStmt(stmt: ExpressionStmt): T;
    visitPrintStmt(stmt: PrintStmt): T;
    visitVarStmt(stmt: VarStmt): T;
    visitBlockStmt(stmt: BlockStmt): T;
    visitIfStmt(stmt: IfStmt): T;
    visitWhileStmt(stmt: WhileStmt): T;
    visitFunctionStmt(stmt: FunctionStmt): T;
    visitReturnStmt(stmt: ReturnStmt): T;
    visitClassStmt(stmt: ClassStmt): T;
}
export declare abstract class Stmt {
    abstract accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class ExpressionStmt extends Stmt {
    expression: Expr;
    constructor(expression: Expr);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class PrintStmt extends Stmt {
    expression: Expr;
    constructor(expression: Expr);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class VarStmt extends Stmt {
    name: Token;
    initializer?: Expr | undefined;
    constructor(name: Token, initializer?: Expr | undefined);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class ClassStmt extends Stmt {
    name: Token;
    superclass: VariableExpr | undefined;
    methods: FunctionStmt[];
    constructor(name: Token, superclass: VariableExpr | undefined, methods: FunctionStmt[]);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class BlockStmt extends Stmt {
    statements: Stmt[];
    constructor(statements: Stmt[]);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class IfStmt extends Stmt {
    condition: Expr;
    thenBranch: Stmt;
    elseBranch?: Stmt | undefined;
    constructor(condition: Expr, thenBranch: Stmt, elseBranch?: Stmt | undefined);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class WhileStmt extends Stmt {
    condition: Expr;
    body: Stmt;
    constructor(condition: Expr, body: Stmt);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class FunctionStmt extends Stmt {
    name: Token;
    params: Token[];
    body: Stmt[];
    constructor(name: Token, params: Token[], body: Stmt[]);
    accept<T>(visitor: StmtVisitor<T>): T;
}
export declare class ReturnStmt extends Stmt {
    keyword: Token;
    value?: Expr | undefined;
    constructor(keyword: Token, value?: Expr | undefined);
    accept<T>(visitor: StmtVisitor<T>): T;
}
