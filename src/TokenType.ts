// export enum TokenType {
//     // Single-character tokens.
//     LEFT_PAREN='LEFT_PAREN', RIGHT_PAREN='RIGHT_PAREN', LEFT_BRACE='LEFT_BRACE', RIGHT_BRACE='RIGHT_BRACE',
//     COMMA='COMMA", DOT="DOT", MINUS="MINUS", PLUS="PLUS", SEMICOLON="SEMICOLON", SLASH="SLASH", STAR="STAR",
  
//     // // One or two character tokens.
//     BANG="BANG", BANG_EQUAL="BANG_EQUAL",
//     // EQUAL, EQUAL_EQUAL,
//     // GREATER, GREATER_EQUAL,
//     // LESS, LESS_EQUAL,
  
//     // // Literals.
//     // IDENTIFIER, STRING, NUMBER,
  
//     // // Keywords.
//     // AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
//     // PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,
  
//     EOF="EOF"
//   }

  export type TokenType = 'LEFT_PAREN' | 'RIGHT_PAREN' | 'LEFT_BRACE' | 'RIGHT_BRACE' | 'COMMA' | 'DOT' | 'MINUS' | 'PLUS' | 'SEMICOLON' | 'SLASH' | 'STAR' | 'BANG' | 'BANG_EQUAL' | 'EQUAL' | 'EQUAL_EQUAL' | 'GREATER' | 'GREATER_EQUAL' | 'LESS' | 'LESS_EQUAL' | 'IDENTIFIER' | 'STRING' | 'NUMBER' | 'AND'| 'CLASS'| 'ELSE'| 'FALSE'| 'FUN'| 'FOR'| 'IF'| 'NIL'| 'OR'|
   'PRINT'| 'RETURN'| 'SUPER'| 'THIS'| 'TRUE'| 'VAR'| 'WHILE' | 'EOF'