import { Lox } from "./Lox";

function runLox() {
    const { argv } = process
    
    if (argv.length > 3) {
        console.log('Too many arguments.')
        process.exit(64)
    }

    else if (argv.length === 3) {
        Lox.runFile(argv[2])
    }
    
    else {
        Lox.runPrompt()
    }
}

runLox()
