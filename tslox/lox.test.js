const { LoxRunner } = require('./dist')
const fs = require('fs')
const path = require('path')


const files = recursiveReaddirSync('./tests')

files.forEach((file) => {
    test(file, () => {
        const source = fs.readFileSync(file, 'utf-8')
        const {output, expectedOutput} = runLox(source)
        expect(output).toEqual(expectedOutput)
    });
})



function getExpectedOutput(source) {
    const lines = source.split('\n');
    const EXPECTED_OUTPUT_REGEX = /\/\/ expect: ?(.*)/;
    const EXPECTED_ERROR_REGEX = /\/\/ Error ?(.*)/;
    const EXPECTED_RUNTIME_ERROR_REGEX = /\/\/ expect runtime error: ?(.*)/;
    const STACK_TRACE_REGEX = /\/\/ \[line (.*)\] ?(.*)/;

    const expectedOutput = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        EXPECTED_OUTPUT_REGEX.lastIndex = 0;

        let match = line.match(EXPECTED_OUTPUT_REGEX);
        if (match) {
            expectedOutput.push(match[1]);
            continue;
        }

        match = line.match(EXPECTED_ERROR_REGEX);
        if (match) {
            expectedOutput.push(`[Line ${i + 1}] ${match[0].replace('// ', '')}`);
            continue;
        }

        match = line.match(EXPECTED_RUNTIME_ERROR_REGEX);
        if (match) {
            expectedOutput.push(match[1]);
            continue;
        }

        match = line.match(STACK_TRACE_REGEX);
        if (match) {
            expectedOutput.push(`[Line ${parseInt(match[1])}] ${match[2]}`);
            continue;
        }
    }

    return expectedOutput
}

function runLox(source) {
    const output = [];
    const expectedOutput = getExpectedOutput(source)
    const lox = new LoxRunner({
        stdOut: (message) => {
            output.push(message);
        },
        errorReporter: ({ formattedMessage }) => {
            output.push(formattedMessage);
        },
    });

    const statements = lox.parse(source)
    if (statements) {
        lox.interpret(statements)
    }

    return {output, expectedOutput}
}

function recursiveReaddirSync(p) {
    let list = []
    const files = fs.readdirSync(p)
    let stats
  
    files.forEach(function (file) {
      stats = fs.lstatSync(path.join(p, file));
      if(stats.isDirectory()) {
        list = list.concat(recursiveReaddirSync(path.join(p, file)));
      } else {
        list.push(path.join(p, file));
      }
    });
  
    return list;
  }