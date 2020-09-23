import React, { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";

interface Props {
    value: string;
	onChange: (value: string) => void;
	run: () => void
	markers: {line: number, message: string}[]
}

type MonacoRef = typeof import("c:/Users/sagi.balazs/sites/tslox/playground/node_modules/monaco-editor/esm/vs/editor/editor.api")

export const Editor: React.FC<Props> = ({ value, onChange, run, markers }) => {
	const ref = useRef<MonacoEditor>()
	const monacoRef = useRef<MonacoRef>()


	useEffect(() => {
		const model = ref.current?.editor?.getModel()
		if (model) {
			monacoRef.current?.editor.setModelMarkers(model, '', markers.map(marker => 
				({
					startColumn: 1,
					endColumn: Infinity,
					startLineNumber: marker.line,
					endLineNumber: marker.line,
					message: marker.message,
					severity: 8
				})
			))
		}
	}, [markers])

	useEffect(() => {
		ref.current?.editor?.addAction({
			id: 'run',
			label: 'Run',
			keybindings: [
				// Ctrl + Enter
				2048 | 3
			],
			run
		});
	}, [run])

    return (
        <MonacoEditor
			editorWillMount={(monaco) => {
				monacoRef.current = monaco
				monaco.languages.register({ id: 'lox' });

				monaco.languages.setLanguageConfiguration('lox', {
                    autoClosingPairs: [{ open: '{', close: '}' },{ open: '(', close: ')' },],
                });
				monaco.languages.setMonarchTokensProvider('lox', {
					// Set defaultToken to invalid to see what you do not tokenize yet
					// defaultToken: 'invalid',				  
					keywords: [
						"and",
						"class",
						"else",
						"false",
						"for",
						"fun",
						"if",
						"nil",
						"or",
						"print",
						"return",
						"super",
						"this",
						"true",
						"var",
						"while",
					],
				  
					operators: [
					  '='
					],
				  
					// we include these common regular expressions
					symbols:  /[=><!~?:&|+\-*\/\^%]+/,
				  
				  
					// The main tokenizer for our languages
					tokenizer: {
					  root: [
						// identifiers and keywords
						[/[a-z_$][\w$]*/, { cases: { 
													 '@keywords': 'keyword',
													 '@default': 'identifier' } }],
				  
						// whitespace
						{ include: '@whitespace' },
				  
				  
						// numbers
						[/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
						[/\d+/, 'number'],
				  

				  
						// strings
						[/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
						[/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],
				  

					  ],
				  
					  comment: [
						[/[^\/*]+/, 'comment' ],
					  ],
				  
					  string: [
						[/[^\\"]+/,  'string'],
						[/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
					  ],
				  
					  whitespace: [
						[/[ \t\r\n]+/, 'white'],
						[/\/\*/,       'comment', '@comment' ],
						[/\/\/.*$/,    'comment'],
					  ],
					},
				  } as any);
				monaco.editor.defineTheme('cobalt', cobalTheme as any)
			}}
			theme="cobalt"
            value={value}
			onChange={onChange}
			language="lox"
			ref={ref as any}
            options={{ minimap: { enabled: false }, scrollbar: {verticalScrollbarSize: 1} }}
        />
    );
};

const cobalTheme = {
	"base": "vs-dark",
	"inherit": true,
	"rules": [
	  {
		"background": "002240",
		"token": ""
	  },
	  {
		"foreground": "e1efff",
		"token": "punctuation - (punctuation.definition.string || punctuation.definition.comment)"
	  },
	  {
		"foreground": "ff628c",
		"token": "constant"
	  },
	  {
		"foreground": "ffdd00",
		"token": "entity"
	  },
	  {
		"foreground": "ff9d00",
		"token": "keyword"
	  },
	  {
		"foreground": "ffee80",
		"token": "storage"
	  },
	  {
		"foreground": "3ad900",
		"token": "string -string.unquoted.old-plist -string.unquoted.heredoc"
	  },
	  {
		"foreground": "3ad900",
		"token": "string.unquoted.heredoc string"
	  },
	  {
		"foreground": "0088ff",
		"fontStyle": "italic",
		"token": "comment"
	  },
	  {
		"foreground": "80ffbb",
		"token": "support"
	  },
	  {
		"foreground": "cccccc",
		"token": "variable"
	  },
	  {
		"foreground": "ff80e1",
		"token": "variable.language"
	  },
	  {
		"foreground": "ffee80",
		"token": "meta.function-call"
	  },
	  {
		"foreground": "f8f8f8",
		"background": "800f00",
		"token": "invalid"
	  },
	  {
		"foreground": "ffffff",
		"background": "223545",
		"token": "text source"
	  },
	  {
		"foreground": "ffffff",
		"background": "223545",
		"token": "string.unquoted.heredoc"
	  },
	  {
		"foreground": "ffffff",
		"background": "223545",
		"token": "source source"
	  },
	  {
		"foreground": "80fcff",
		"fontStyle": "italic",
		"token": "entity.other.inherited-class"
	  },
	  {
		"foreground": "9eff80",
		"token": "string.quoted source"
	  },
	  {
		"foreground": "80ff82",
		"token": "string constant"
	  },
	  {
		"foreground": "80ffc2",
		"token": "string.regexp"
	  },
	  {
		"foreground": "edef7d",
		"token": "string variable"
	  },
	  {
		"foreground": "ffb054",
		"token": "support.function"
	  },
	  {
		"foreground": "eb939a",
		"token": "support.constant"
	  },
	  {
		"foreground": "ff1e00",
		"token": "support.type.exception"
	  },
	  {
		"foreground": "8996a8",
		"token": "meta.preprocessor.c"
	  },
	  {
		"foreground": "afc4db",
		"token": "meta.preprocessor.c keyword"
	  },
	  {
		"foreground": "73817d",
		"token": "meta.sgml.html meta.doctype"
	  },
	  {
		"foreground": "73817d",
		"token": "meta.sgml.html meta.doctype entity"
	  },
	  {
		"foreground": "73817d",
		"token": "meta.sgml.html meta.doctype string"
	  },
	  {
		"foreground": "73817d",
		"token": "meta.xml-processing"
	  },
	  {
		"foreground": "73817d",
		"token": "meta.xml-processing entity"
	  },
	  {
		"foreground": "73817d",
		"token": "meta.xml-processing string"
	  },
	  {
		"foreground": "9effff",
		"token": "meta.tag"
	  },
	  {
		"foreground": "9effff",
		"token": "meta.tag entity"
	  },
	  {
		"foreground": "9effff",
		"token": "meta.selector.css entity.name.tag"
	  },
	  {
		"foreground": "ffb454",
		"token": "meta.selector.css entity.other.attribute-name.id"
	  },
	  {
		"foreground": "5fe461",
		"token": "meta.selector.css entity.other.attribute-name.class"
	  },
	  {
		"foreground": "9df39f",
		"token": "support.type.property-name.css"
	  },
	  {
		"foreground": "f6f080",
		"token": "meta.property-group support.constant.property-value.css"
	  },
	  {
		"foreground": "f6f080",
		"token": "meta.property-value support.constant.property-value.css"
	  },
	  {
		"foreground": "f6aa11",
		"token": "meta.preprocessor.at-rule keyword.control.at-rule"
	  },
	  {
		"foreground": "edf080",
		"token": "meta.property-value support.constant.named-color.css"
	  },
	  {
		"foreground": "edf080",
		"token": "meta.property-value constant"
	  },
	  {
		"foreground": "eb939a",
		"token": "meta.constructor.argument.css"
	  },
	  {
		"foreground": "f8f8f8",
		"background": "000e1a",
		"token": "meta.diff"
	  },
	  {
		"foreground": "f8f8f8",
		"background": "000e1a",
		"token": "meta.diff.header"
	  },
	  {
		"foreground": "f8f8f8",
		"background": "4c0900",
		"token": "markup.deleted"
	  },
	  {
		"foreground": "f8f8f8",
		"background": "806f00",
		"token": "markup.changed"
	  },
	  {
		"foreground": "f8f8f8",
		"background": "154f00",
		"token": "markup.inserted"
	  },
	  {
		"background": "8fddf630",
		"token": "markup.raw"
	  },
	  {
		"background": "004480",
		"token": "markup.quote"
	  },
	  {
		"background": "130d26",
		"token": "markup.list"
	  },
	  {
		"foreground": "c1afff",
		"fontStyle": "bold",
		"token": "markup.bold"
	  },
	  {
		"foreground": "b8ffd9",
		"fontStyle": "italic",
		"token": "markup.italic"
	  },
	  {
		"foreground": "c8e4fd",
		"background": "001221",
		"fontStyle": "bold",
		"token": "markup.heading"
	  }
	],
	"colors": {
	  "editor.foreground": "#FFFFFF",
	  "editor.background": "#002240",
	  "editor.selectionBackground": "#B36539BF",
	  "editor.lineHighlightBorder": "#00000000",
	  "editorCursor.foreground": "#FFFFFF",
	  "editorWhitespace.foreground": "#FFFFFF26",
	}
  }