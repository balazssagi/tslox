import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr } from "./Expr"
import { Lox } from "./Lox"
import { Token } from "./Token"
import { TokenType } from "./TokenType"

export class Parser {
    private current = 0

    constructor(private tokens: Token[]) {}

    public parse() {
        try {
            return this.expression()
        }
        catch(e) {
            return null
        }
    }

    private expression(): Expr {
        return this.equality()
    }

    private equality(): Expr {
        let expr = this.comparison()

        while (this.match('BANG', 'BANG_EQUAL')) {
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
}

class ParseError extends Error {}