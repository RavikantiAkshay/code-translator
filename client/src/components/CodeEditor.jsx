import Editor from "@monaco-editor/react";
import {Monaco_Language_Map} from "../utils/languageMap.js";

function CodeEditor({code, onChange, language, readOnly = false}) {
    return (
        <Editor
            height="100%"
            language = {Monaco_Language_Map[language]}
            value={code}    
            onChange={ (v) => onChange(v || " ") }
            theme="vs-dark"
            options={{
                fontsize: 14,
                fontfamily: "JetBrains Mono, monospace",
                minimap : {enabled: false},
                scrollBeyondLastLine: false,
                wordwrap: "on",
                readOnly,
                padding: 
                {
                    top: 14,
                    bottom: 14 
                },
                automaticlayout: true,
                tabsize: 2,
                lineNumbers: "on",
                renderLineHighlight: "all",
                bracketPairColorization: {enabled: true},
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                matchBrackets: "always",
                formatOnPaste: true,
                suggestOnTriggerCharacters: true,
                folding: true,
                smoothScrolling: true,
                fixedOverflowWidgets: true,
                

            }}     

            loading={<div className="loading-state">
                <p>Loading Editor...</p>
                </div>}
        />
    )
}

export default CodeEditor;