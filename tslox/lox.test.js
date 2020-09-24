const { Lox } = require('./dist')
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
    const EXPECTED_OUTPUT_REGEX = /expect: ?(.*)/;
    const EXPECTED_ERROR_REGEX = /Error ?(.*)/;
    const EXPECTED_RUNTIME_ERROR_REGEX = /expect runtime error: ?(.*)/;

    const expectedOutput = [];

    for (let line of lines) {
        EXPECTED_OUTPUT_REGEX.lastIndex = 0;

        let match = line.match(EXPECTED_OUTPUT_REGEX);
        if (match) {
            expectedOutput.push(match[1]);
            continue;
        }

        match = line.match(EXPECTED_ERROR_REGEX);
        if (match) {
            expectedOutput.push(match[0]);
            continue;
        }

        match = line.match(EXPECTED_RUNTIME_ERROR_REGEX);
        if (match) {
            expectedOutput.push(match[1]);
            continue;
        }
    }

    return expectedOutput
}

function runLox(source) {
    const output = [];
    const expectedOutput = getExpectedOutput(source)
    const lox = new Lox({
        stdOut: (message) => {
            output.push(message);
        },
        errorReporter: ({ formattedMessage }) => {
            output.push(formattedMessage);
        },
    });

    const statements = lox.parse(source)
    if (statements) {
        lox.run(statements)
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