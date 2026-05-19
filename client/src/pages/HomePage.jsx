import { useState } from "react";
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

function HomePage() {
  const [code, setCode] = useState(STARTER_CODE["python"] || "");
  const [sourceLanguage, setSourceLanguage] = useState("python");
  const [targetLanguage, setTargetLanguage] = useState("javascript");
  const [activeAction, setActiveAction] = useState("translate");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSourceChange = (e) => {
    const lang = e.target.value;
    setSourceLanguage(lang);
    if (STARTER_CODE[lang]) {
      setCode(STARTER_CODE[lang]);
    }
    setResult(null);
  };

  const handleTargetChange = (e) => {
    setTargetLanguage(e.target.value);
    setResult(null);
  };

  const handleActionChange = (actionId) => {
    setActiveAction(actionId);
    setResult(null);
  };

  const handleRun = async () => {
    if (!code || !code.trim()) {
      toast.error("Please enter some code to analyze.");
      return;
    }

    setLoading(true);
    setResult(null);

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

        <section className="pane pane-left">
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
          </div>
        </section>

        <section className="pane pane-right">
          <div className="pane-header">
            <span>AI Output</span>
            {result && (
              <button
                onClick={handleCopy}
                style={{
                  background: "transparent",
                  border: "1px solid #27272a",
                  color: "#a1a1aa",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.color = "#ffffff";
                  e.target.style.borderColor = "#ffffff";
                }}
                onMouseOut={(e) => {
                  e.target.style.color = "#a1a1aa";
                  e.target.style.borderColor = "#27272a";
                }}
              >
                Copy Output
              </button>
            )}
          </div>
          <div className="pane-content">
            <OutputPanel 
              key="primary-output-panel"
              result={result} 
              action={activeAction} 
              targetLanguage={targetLanguage} 
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;