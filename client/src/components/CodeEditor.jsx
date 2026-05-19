import { useContext } from "react";
import Editor from "@monaco-editor/react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { MONACO_LANGUAGES } from "../constants/language.js";

function CodeEditor({ code, onChange, language, readOnly = false }) {
  const { theme } = useContext(ThemeContext);

  return (
    <Editor
      height="100%"
      language={MONACO_LANGUAGES[language] || "javascript"}
      value={code}
      onChange={(v) => onChange && onChange(v || "")}
      theme={theme === "dark" ? "vs-dark" : "vs"}
      options={{
        fontSize: 14,
        fontFamily: "Consolas, 'Courier New', monospace",
        fontLigatures: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        readOnly,
        padding: {
          top: 14,
          bottom: 14,
        },
        automaticLayout: true,
        tabSize: 2,
        lineNumbers: "on",
        renderLineHighlight: "all",
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        matchBrackets: "always",
        formatOnPaste: true,
        suggestOnTriggerCharacters: true,
        folding: true,
        smoothScrolling: true,
        fixedOverflowWidgets: true,
      }}
      loading={
        <div className="loading-state">
          <p>Loading Editor...</p>
        </div>
      }
    />
  );
}

export default CodeEditor;