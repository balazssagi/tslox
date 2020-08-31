import { AssignExpr, BinaryExpr, Expr, GroupingExpr, LiteralExpr, LogicalExpr, UnaryExpr, VariableExpr } from "./Expr"
import { RuntimeError } from "./Interpreter"
import { Lox } from "./Lox"
import { BlockStmt, ExpressionStmt, IfStmt, PrintStmt, Stmt, VarStmt, WhileStmt } from "./Stmt"
import { Token } from "./Token"
import { TokenType } from "./TokenType"

export class Parser {
    private current = 0

    constructor(private tokens: Token[]) {}

    public parse() {
        const statements: Stmt[] = []
        while (!this.isAtEnd()) {
            const declaration = this.declaration()
            if (declaration) {
                statements.push(declaration)
            }
        }
        
        return statements
    }

    private declaration() {
        try {
            if (this.match('VAR')) {
                return this.varDeclaration()
            }
            return this.statement()
        }
        catch(e) {
            this.synchronize()
            return null
        }
    }

    private varDeclaration() {
        const name = this.consume('IDENTIFIER', "Expect variable name.")

        let initializer: Expr | undefined
        if (this.match('EQUAL')) {
            initializer = this.expression()
        }
        this.consume('SEMICOLON', "Expect ';' after variable declaration.")
        return new VarStmt(name, initializer)
    }

    private statement() {
        if (this.match('IF')) {
            return this.ifStatement()
        }
        if (this.match('WHILE')) {
            return this.whileStatement()
        }
        if (this.match('PRINT')) {
            return this.printStatement()
        }
        if (this.match('LEFT_BRACE')) {
            return this.blockStatemnt()
        }

        return this.expressionStatement()
    }

    private ifStatement(): Stmt {
        this.consume('LEFT_PAREN', "Expect '(' after 'if'.")
        const condition = this.expression()
        this.consume('RIGHT_PAREN', "Expect ')' after if condition.")

        const thenBranch = this.statement()
        let elseBranch: Stmt | undefined
        if (this.match('ELSE')) {
            elseBranch = this.statement()
        }
        return new IfStmt(condition, thenBranch, elseBranch)
    }

    private whileStatement(): Stmt {
        this.consume('LEFT_PAREN', "Expect '(' after 'while'.")
        const condition = this.expression()
        this.consume('RIGHT_PAREN', "Expect ')' after while condition.")
        const body = this.statement()

        return new WhileStmt(condition, body)
    }

    private printStatement() {
        const expr = this.expression()
        this.consume('SEMICOLON', "Expect ';' after value.")
        return new PrintStmt(expr)
    }

    private blockStatemnt() {
        const statements: Stmt[] = []

        while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
            const statement = this.declaration()
            if (statement) {
                statements.push(statement)
            }
        }

        this.consume('RIGHT_BRACE', "Expect '}' after block.")

        return new BlockStmt(statements)
    }

    private expressionStatement() {
        const expr = this.expression()
        this.consume('SEMICOLON', "Expect ';' after expression.")
        return new ExpressionStmt(expr)
    }

    private expression(): Expr {
        return this.assignment()
    }

    private assignment(): Expr {
        const expr = this.or()

        if (this.match('EQUAL')) {
            const equals = this.previous()
            const value = this.or()

            if (expr instanceof VariableExpr) {
               const name = expr.name
               return new AssignExpr(name, value)
            }

            this.error(equals, 'Invalid left-hand side in assignment.')
        }

        return expr
    }

    private or(): Expr {
        const expr = this.and()

        while(this.match('OR')) {
            const operator = this.previous()
            const right = this.and()
            return new LogicalExpr(expr, operator, right)
        }

        return expr
    }

    private and(): Expr {
        const expr = this.equality()

        while(this.match('AND')) {
            const operator = this.previous()
            const right = this.equality()
            return new LogicalExpr(expr, operator, right)
        }

        return expr
    }

    private equality(): Expr {
        let expr = this.comparison()

        while (this.match('BANG_EQUAL', 'EQUAL_EQUAL')) {
            const operator = this.previous()
            const right = this.comparison()
            expr = new BinaryExpr(expr, operator, right)
        }

        return expr
    }

    private comparison(): Expr {
        let expr = this.addition()

        while (this.match('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL')) {
            const operator = this.previous()
            const right = this.addition()
            expr = new BinaryExpr(expr, operator, right)
        }

        return expr
    }

    private addition(): Expr {
        let expr = this.multiplication()

        while (this.match('MINUS', 'PLUS')) {
            const operator = this.previous()
            const right = this.multiplication()
            expr = new BinaryExpr(expr, operator, right)
        }

        return expr
    }

    private multiplication(): Expr {
        let expr = this.unary()

        while (this.match('SLASH', 'STAR')) {
            const operator = this.previous()
            const right = this.unary()
            expr = new BinaryExpr(expr, operator, right)
        }

        return expr
    }

    private unary(): Expr {
        if (this.match('BANG', 'MINUS')) {
            const operator = this.previous()
            const right = this.unary()
            return new UnaryExpr(operator, right)
        }
        return this.primary()
    }

    private primary(): Expr {
        if (this.match('FALSE')) return new LiteralExpr(false)
        if (this.match('TRUE')) return new LiteralExpr(true)
        if (this.match('NIL')) return new LiteralExpr(null)

        if (this.match('NUMBER', 'STRING')) {
            return new LiteralExpr(this.previous().literal)
        }

        if (this.match('LEFT_PAREN')) {
            const expr = this.expression()
            this.consume('RIGHT_PAREN', "Expect ')' after expression.")
            return new GroupingExpr(expr)
        }

        if (this.match('IDENTIFIER')) {
            return new VariableExpr(this.previous())
        }

        throw this.error(this.peek(), "Expect expression.")
    }

    private error(token: Token, message: string) {
        Lox.error(token.line, message)
        return new ParseError()
    }

    private consume(type: TokenType, message: string) {
        if (this.check(type)) {
            return this.advance()
        }

        throw this.error(this.peek(), message)
    }


    private match(...types: TokenType[]) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance()
                return true
            }
        }
        return false
    }

    private check(type: TokenType) {
        if (this.isAtEnd()) {
            return false
        }
        return this.peek().type === type
    }

    private advance() {
        if (!this.isAtEnd()) {
            this.current++
        }
        return this.previous()
    }

    private isAtEnd() {
        return this.peek().type === 'EOF'
    }

    private peek() {
        return this.tokens[this.current]
    }

    private previous() {
        return this.tokens[this.current - 1]
    }

    private synchronize() {
        this.advance()

        while (!this.isAtEnd()) {
            if (this.previous().type === 'SEMICOLON') {
                return
            }
            switch (this.peek().type) {
                case 'CLASS':
                case 'FUN':
                case 'VAR':
                case 'FOR':
                case 'IF':
                case 'WHILE':
                case 'PRINT':
                case 'RETURN':
                      return;
            }

            this.advance()
        }
    }
}

class ParseError extends Error {}