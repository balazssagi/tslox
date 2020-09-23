import React, { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";

interface Props {
    value: string;
	onChange: (value: string) => void;
	run: () => void
}

export const Editor: React.FC<Props> = ({ value, onChange, run }) => {
	const ref = useRef<any>()

	useEffect(() => {
		if (ref.current) {
			ref.current.editor.addAction({
				id: 'run',
				label: 'Run',
				keybindings: [
					// Ctrl + Enter
					2048 | 3
				],
				run
			});
		}
	}, [run])

    return (
        <MonacoEditor
            theme="vs-dark"
            value={value}
			onChange={onChange}
			ref={ref}
            options={{ minimap: { enabled: false } }}
        />
    );
};
