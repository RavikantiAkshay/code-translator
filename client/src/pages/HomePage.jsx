import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import { LANGUAGES, STARTER_CODE } from "../constants/language.js";
import {
  translateCode,
  analyzeComplexity,
  optimizeCode,
  explainCode,
} from "../services/codeService.js";

import "../styles/home.css";

const ACTIONS = [
  { id: "translate", label: "Translate" },
  { id: "analyze", label: "Complexity" },
  { id: "optimize", label: "Optimize" },
  { id: "explain", label: "Explain" },
];

// Helper to map file extensions to editor language IDs
const extensionMap = {
  py: "python",
  js: "javascript",
  ts: "typescript",
  java: "java",
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  cs: "csharp",
};

function HomePage() {
  const [code, setCode] = useState(STARTER_CODE["python"] || "");
  const [sourceLanguage, setSourceLanguage] = useState("python");
  const [targetLanguage, setTargetLanguage] = useState("javascript");
  const [activeAction, setActiveAction] = useState("translate");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Enhancement States: Split resizer, visual diff, drag & drop
  const [leftWidth, setLeftWidth] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Track original code sent to AI for visual diff comparison
  const [sentCode, setSentCode] = useState("");

  const handleSourceChange = (e) => {
    const lang = e.target.value;
    setSourceLanguage(lang);
    if (STARTER_CODE[lang]) {
      setCode(STARTER_CODE[lang]);
    }
    setResult(null);
    setShowDiff(false);
  };

  const handleTargetChange = (e) => {
    setTargetLanguage(e.target.value);
    setResult(null);
    setShowDiff(false);
  };

  const handleActionChange = (actionId) => {
    setActiveAction(actionId);
    setResult(null);
    setShowDiff(false);
  };

  const handleRun = async () => {
    if (!code || !code.trim()) {
      toast.error("Please enter some code to analyze.");
      return;
    }

    setLoading(true);
    setResult(null);
    setSentCode(code); // Cache code version sent to AI

    try {
      let response;
      if (activeAction === "translate") {
        if (sourceLanguage === targetLanguage) {
          toast.error("Source and Target languages must be different for translation.");
          setLoading(false);
          return;
        }
        response = await translateCode(code, sourceLanguage, targetLanguage);
      } else if (activeAction === "analyze") {
        response = await analyzeComplexity(code, sourceLanguage);
      } else if (activeAction === "optimize") {
        response = await optimizeCode(code, sourceLanguage);
      } else if (activeAction === "explain") {
        response = await explainCode(code, sourceLanguage);
      }

      setResult(response);
      toast.success("AI compilation successful!");
    } catch (error) {
      console.error(error);
      const rawMsg = error.response?.data?.message || "";
      if (
        rawMsg.includes("503") ||
        rawMsg.toLowerCase().includes("high demand") ||
        rawMsg.toLowerCase().includes("unavailable") ||
        rawMsg.toLowerCase().includes("rate limit")
      ) {
        toast.error("AI engines are currently experiencing high demand. Please wait a second and click 'Run Action' again!", {
          duration: 6000,
        });
      } else {
        toast.error(rawMsg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  // Enhancement: Draggable Grid Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = document.querySelector(".workspace-grid");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    if (newWidth > 280 && newWidth < rect.width - 280) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Enhancement: Drag and Drop Files
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const extension = file.name.split(".").pop()?.toLowerCase();

      try {
        const fileContent = await file.text();
        setCode(fileContent);

        // Auto detect and switch input language selection
        if (extension && extensionMap[extension]) {
          setSourceLanguage(extensionMap[extension]);
          toast.success(`Loaded ${file.name} (detected: ${LANGUAGES.find(l => l.id === extensionMap[extension])?.name || extension})`);
        } else {
          toast.success(`Loaded ${file.name}`);
        }
        setResult(null);
        setShowDiff(false);
      } catch (err) {
        toast.error("Failed to read script file.");
      }
    }
  };

  // Enhancement: Script Output Downloader
  const handleDownload = () => {
    if (!result) return;

    let displayResult = result;
    if (activeAction !== "translate") {
      // If code optimization/explanations contain codeblocks, extract the code block contents
      const codeBlockRegex = /```\w*\n([\s\S]*?)```/;
      const match = result.match(codeBlockRegex);
      if (match && match[1]) {
        displayResult = match[1].trim();
      }
    }

    const blob = new Blob([displayResult], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const extMap = {
      python: "py",
      javascript: "js",
      typescript: "ts",
      java: "java",
      c: "c",
      cpp: "cpp",
      csharp: "cs",
    };

    const ext = activeAction === "translate" 
      ? (extMap[targetLanguage] || "txt") 
      : (extMap[sourceLanguage] || "txt");

    a.download = `smart_compilation_${activeAction}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  return (
    <div className="home-container">
      {/* Upper toolbar */}
      <header className="home-toolbar">
        <div className="toolbar-selectors">
          <div className="selector-group">
            <label>Source Language</label>
            <select
              value={sourceLanguage}
              onChange={handleSourceChange}
              className="dark-lang-select"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="action-pills">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionChange(action.id)}
                className={`action-pill ${activeAction === action.id ? "active" : ""}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {activeAction === "translate" && (
            <div className="selector-group">
              <label>Target Language</label>
              <select
                value={targetLanguage}
                onChange={handleTargetChange}
                className="dark-lang-select"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button onClick={handleRun} disabled={loading} className="run-btn">
          {loading ? (
            <>
              <div className="spinner" style={{ borderTopColor: "#09090b" }}></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>Run Action</span>
          )}
        </button>
      </header>

      {/* Editor Grid Workspace */}
      <main className="workspace-grid">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner" style={{ width: "40px", height: "40px", borderTopColor: "#ffffff", borderWidth: "3px" }}></div>
            <p className="loading-text">AI is writing some magic...</p>
          </div>
        )}

        <section 
          className="pane pane-left"
          style={leftWidth ? { width: `${leftWidth}px`, flexGrow: 0, flexShrink: 0 } : { flex: 1 }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="pane-header">
            <span>Input Code</span>
          </div>
          <div className="pane-content">
            <CodeEditor 
              key="input-code-editor" 
              code={code} 
              onChange={setCode} 
              language={sourceLanguage} 
            />

            {/* Drag & Drop Overlay */}
            <div className={`file-drag-zone ${dragActive ? "active" : ""}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Drop code script file here</p>
            </div>
          </div>
        </section>

        {/* Draggable Divider */}
        <div 
          className={`resize-divider ${isDragging ? "dragging" : ""}`}
          onMouseDown={handleMouseDown}
        />

        <section className="pane pane-right" style={{ flex: 1 }}>
          <div className="pane-header">
            <span>AI Output</span>
            {result && (
              <div className="pane-header-actions">
                {/* Visual Diff View Switcher */}
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`header-action-btn ${showDiff ? "active" : ""}`}
                  title="Toggle original vs compiled side-by-side comparison"
                >
                  {showDiff ? "Output View" : "Diff View"}
                </button>

                {/* Local Script Downloader */}
                <button
                  onClick={handleDownload}
                  className="header-action-btn"
                  title="Download result script to local file"
                >
                  Download
                </button>

                <button
                  onClick={handleCopy}
                  className="header-action-btn"
                  title="Copy result contents to clipboard"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
          <div className="pane-content">
            <OutputPanel 
              key="primary-output-panel"
              result={result} 
              action={activeAction} 
              targetLanguage={targetLanguage} 
              showDiff={showDiff}
              originalCode={sentCode}
              sourceLanguage={sourceLanguage}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;