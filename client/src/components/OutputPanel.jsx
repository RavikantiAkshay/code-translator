import { useContext } from "react";
import { DiffEditor } from "@monaco-editor/react";
import CodeEditor from "./CodeEditor.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import "../styles/output.css";

function OutputPanel({ 
  result, 
  action, 
  targetLanguage, 
  showDiff = false, 
  originalCode = "", 
  sourceLanguage = "" 
}) {
  const { theme } = useContext(ThemeContext);

  if (!result) {
    return (
      <div className="empty-state">
        <p>Write Code, pick an action, and hit <span>Run</span></p>
      </div>
    );
  }

  // Visual Diff View mode override
  if (showDiff) {
    // Extracted code result for non-translate actions (explain/optimize might have markdown)
    // If it has markdown, we extract the first code block, or fall back to the whole text
    let displayResult = result;
    if (action !== "translate") {
      const codeBlockRegex = /```\w*\n([\s\S]*?)```/;
      const match = result.match(codeBlockRegex);
      if (match && match[1]) {
        displayResult = match[1].trim();
      }
    }

    return (
      <div className="output-full-height">
        <DiffEditor
          original={originalCode || ""}
          modified={displayResult || ""}
          language={action === "translate" ? targetLanguage : sourceLanguage}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontFamily: "Consolas, 'Courier New', monospace",
            fontSize: 14,
            automaticLayout: true,
            originalEditable: false,
          }}
          loading={
            <div className="loading-state">
              <p>Loading Diff Viewer...</p>
            </div>
          }
        />
      </div>
    );
  }

  if (action === "translate") {
    return (
      <div className="output-full-height">
        <CodeEditor 
          key="translate-output-editor"
          code={result || ""} 
          onChange={() => {}} 
          language={targetLanguage} 
          readOnly 
        />
      </div>
    );
  }

  // For explain, analyze, and optimize actions, we use our premium MarkdownRenderer
  return (
    <div className="output-scroll-container">
      <MarkdownRenderer content={result} language={targetLanguage} />
    </div>
  );
}

function MarkdownRenderer({ content, language }) {
  if (!content) return null;

  // Split code blocks and text blocks
  const parts = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push({ type: "text", value: textBefore });
    }
    parts.push({ type: "code", lang: match[1] || language, value: match[2] });
    lastIndex = regex.lastIndex;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText.trim()) {
    parts.push({ type: "text", value: remainingText });
  }

  if (parts.length === 0) {
    parts.push({ type: "text", value: content });
  }

  return (
    <div className="markdown-container">
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <div key={index} className="output-editor-area">
              <CodeEditor 
                key={`markdown-code-${index}`}
                code={part.value.trim()} 
                onChange={() => {}} 
                language={part.lang} 
                readOnly 
              />
            </div>
          );
        } else {
          const lines = part.value.split("\n");
          return (
            <div key={index} className="text-block">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("###")) {
                  return <h3 key={lIdx} className="markdown-h3">{trimmed.replace("###", "").trim()}</h3>;
                }
                if (trimmed.startsWith("##")) {
                  return <h2 key={lIdx} className="markdown-h2">{trimmed.replace("##", "").trim()}</h2>;
                }
                if (trimmed.startsWith("#")) {
                  return <h1 key={lIdx} className="markdown-h1">{trimmed.replace("#", "").trim()}</h1>;
                }
                if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                  return (
                    <li key={lIdx} className="markdown-li">
                      {formatBoldText(trimmed.substring(1).trim())}
                    </li>
                  );
                }
                if (trimmed === "") return <div key={lIdx} className="markdown-spacing" />;
                
                return <p key={lIdx} className="markdown-p">{formatBoldText(trimmed)}</p>;
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

function formatBoldText(text) {
  const parts = [];
  const boldRegex = /\*\*([\s\S]*?)\*\*/g;
  let lastIdx = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    const before = text.substring(lastIdx, match.index);
    if (before) parts.push(before);
    parts.push(<strong key={match.index} className="markdown-strong">{match[1]}</strong>);
    lastIdx = boldRegex.lastIndex;
  }

  const after = text.substring(lastIdx);
  if (after) parts.push(after);

  return parts.length > 0 ? parts : text;
}

export default OutputPanel;
