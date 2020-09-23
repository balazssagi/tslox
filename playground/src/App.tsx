import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { Lox } from 'tslox';
import { Editor } from './components/Editor';
import { Box, Button, Stack, Text } from '@chakra-ui/core';
import { useDebouncedCallback } from 'use-debounce';

type Output = { type: 'stdOut' | 'stdErr'; message: string };

function getInitialCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
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
    const [markers, setMarkers] = useState<{ line: number; message: string }[]>(
        []
    );
    const [, setIsValid] = useState(false);
    const scrollRef = useRef<HTMLPreElement>();
    const lox = useRef(
        new Lox({
            stdOut: (message) => {
                setOutput((o) => [...o, { type: 'stdOut', message }]);
            },
            errorReporter: ({ formattedMessage, line, message }) => {
                setOutput((o) => [
                    ...o,
                    { type: 'stdErr', message: formattedMessage },
                ]);
                setMarkers((markers) => [...markers, { line, message }]);
            },
        })
    );

    const debounced = useDebouncedCallback(
        () => {
            lox.current.parse(source)
        },
        1000,
    );

    useEffect(() => {
        setMarkers([]);
        window.history.replaceState(
            null,
            '',
            window.location.pathname + '?code=' + btoa(source)
        );
        debounced.callback()
        // setIsValid(!!statements);
    }, [source, debounced]);
    

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    const run = useCallback(() => {
        setOutput([]);
        const statements = lox.current.parse(source);
        if (statements) {
            lox.current.run(statements);
        }
    }, [source]);

    return (
        <Box
            display='grid'
            gridTemplateColumns='1fr 1fr'
            gridTemplateRows='auto 1fr'
            height='100vh'
            overflow='hidden'
        >
            <Box
                borderBottom='solid 1px #555'
                gridColumn='span 2'
                backgroundColor='#002240'
                alignItems='center'
                display='flex'
                py='3'
                px='8'
            >
                <Stack isInline alignItems='center' spacing='6'>
                    <Text fontSize={16} fontFamily='monospace' color='gray.500'>
                        <strong>Lox </strong>Playground
                    </Text>
                    <Button size='sm' variantColor='green' onClick={run}>
                        Run (Ctrl + Enter)
                    </Button>
                </Stack>
            </Box>
            <Editor
                value={source}
                onChange={setSource}
                run={run}
                markers={markers}
            />
            <Box
                backgroundColor='#002240'
                overflow='hidden'
                display='flex'
                flexDirection='column'
            >
                <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    px='3'
                    py='1'
                    backgroundColor='#052b4c'
                >
                    <Text color='gray.500'>Output</Text>
                    <Button
                        size='sm'
                        variant='outline'
                        variantColor='yellow'
                        onClick={() => {
                            setOutput([]);
                        }}
                    >
                        Clear
                    </Button>
                </Box>
                <Box
                    as='pre'
                    overflow='auto'
                    height='100%'
                    ref={scrollRef}
                >
                    {output.map((entry, i) => (
                        <Box
                            p='2'
                            borderBottom="solid 1px"
                            borderColor={entry.type === 'stdErr' ? '#e53e3e29' : '#ffffff10'}
                            backgroundColor={
                                entry.type === 'stdErr' ? '#e53e3e29' : undefined
                            }
                            key={i}
                            color={
                                entry.type === 'stdErr' ? 'red.500' : 'white'
                            }
                        >
                            {entry.message}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

export default App;
