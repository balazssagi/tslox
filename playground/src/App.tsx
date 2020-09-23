import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Lox } from "tslox";
import { Editor } from "./components/Editor";
import { Box, Button, Stack } from "@chakra-ui/core";

type Output = { type: "stdOut" | "stdErr"; message: string };

function getInitialCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code !== null) {
        try {
            return window.atob(code);
        } catch (e) {}
    }
    return 'print "Hello, Lox!";';
}

function App() {
    const [source, setSource] = useState(getInitialCode);
    const [output, setOutput] = useState<Output[]>([]);
    const [,setIsValid] = useState(false);
    const lox = useRef(
        new Lox({
            stdOut: (message) => {
                setOutput((o) => [...o, { type: "stdOut", message }]);
            },
            errorReporter: ({ formattedMessage, line, message }) => {
              console.log(line, message)
                setOutput((o) => [...o, { type: "stdErr", message: formattedMessage }]);
            },
        })
    );

    useEffect(() => {
        window.history.replaceState(null, "", window.location.pathname + "?code=" + btoa(source));
        const statements = lox.current.parse(source);
        setIsValid(!!statements);
    }, [source]);

    const run = useCallback(() => {
        const statements = lox.current.parse(source);
        if (statements) {
            lox.current.run(statements);
        }
    }, [source])

    return (
        <Box display="grid" gridTemplateColumns="1fr 1fr" gridTemplateRows="3rem 1fr" height="100vh">
            <Box borderBottom="solid 1px #555" gridColumn="span 2" backgroundColor="#1e1e1e" alignItems="center" display="flex" p="3">
                <Stack isInline>
                    <Button size="sm" variantColor="green" onClick={run}>Run (Ctrl + Enter)</Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            setOutput([]);
                        }}
                    >
                        Clear
                    </Button>
                </Stack>
            </Box>
            <Editor value={source} onChange={setSource} run={run}/>
            <Box backgroundColor="#1e1e1e">
                <pre>
                    {output.map((entry, i) => (
                        <Box key={i} color={entry.type === 'stdErr' ? 'red.500' : 'white'}>
                            {entry.message}
                        </Box>
                    ))}
                </pre>
            </Box>
        </Box>
    );
}

export default App;
