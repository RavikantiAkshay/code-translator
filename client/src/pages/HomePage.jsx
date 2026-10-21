import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import VerificationPipeline from "../components/VerificationPipeline.jsx";
import { LANGUAGES, STARTER_CODE } from "../constants/language.js";
import {
  translateAndVerifyAsync,
  connectToJobStream,
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

const STORAGE_KEY = "code_translator_workspace";

const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

function HomePage() {
  const saved = useRef(loadSavedState()).current;

  const [sourceLanguage, setSourceLanguage] = useState(saved?.sourceLanguage || "python");
  const [targetLanguage, setTargetLanguage] = useState(saved?.targetLanguage || "javascript");
  const [code, setCode] = useState(saved?.code !== undefined ? saved.code : (STARTER_CODE["python"] || ""));
  const [activeAction, setActiveAction] = useState(saved?.activeAction || "translate");
  const [result, setResult] = useState(saved?.result || null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(saved?.verificationStatus || null);
  const [showLogs, setShowLogs] = useState(saved?.showLogs || false);

  // Cache per-action outputs so switching actions preserves previous results
  const [actionCache, setActionCache] = useState(saved?.actionCache || {});

  // File Picker ref
  const fileInputRef = useRef(null);

  // Enhancement States: Split resizer, visual diff, drag & drop
  const [leftWidth, setLeftWidth] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDiff, setShowDiff] = useState(saved?.showDiff || false);
  const [dragActive, setDragActive] = useState(false);

  // Track original code sent to AI for visual diff comparison
  const [sentCode, setSentCode] = useState(saved?.sentCode || "");

  // Persist state memory to localStorage across route changes and refreshes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sourceLanguage,
          targetLanguage,
          code,
          activeAction,
          result,
          verificationStatus,
          sentCode,
          showDiff,
          actionCache,
        })
      );
    } catch (_) {}
  }, [sourceLanguage, targetLanguage, code, activeAction, result, verificationStatus, sentCode, showDiff, actionCache]);

  const handleSourceChange = (e) => {
    const lang = e.target.value;
    setSourceLanguage(lang);
    if (STARTER_CODE[lang]) {
      setCode(STARTER_CODE[lang]);
    }
    setResult(null);
    setShowDiff(false);
    setVerificationStatus(null);
    setShowLogs(false);
  };

  const handleTargetChange = (e) => {
    setTargetLanguage(e.target.value);
    setResult(null);
    setShowDiff(false);
    setVerificationStatus(null);
    setShowLogs(false);
  };

  const handleActionChange = (actionId) => {
    if (actionId === activeAction) return;

    // 1. Cache current action's outputs before switching
    const updatedCache = {
      ...actionCache,
      [activeAction]: {
        result,
        verificationStatus,
        sentCode,
        showDiff,
      },
    };
    setActionCache(updatedCache);

    // 2. Set new active action
    setActiveAction(actionId);

    // 3. Restore previous outputs for this action if available, or reset to null
    const cached = updatedCache[actionId];
    if (cached) {
      setResult(cached.result || null);
      setVerificationStatus(cached.verificationStatus || null);
      setSentCode(cached.sentCode || "");
      setShowDiff(cached.showDiff || false);
    } else {
      setResult(null);
      setVerificationStatus(null);
      setShowDiff(false);
    }
  };

  const handleRun = async () => {
    if (!code || !code.trim()) {
      toast.error("Please enter some code to analyze.");
      return;
    }

    setLoading(true);
    setResult(null);
    setShowLogs(false);
    setSentCode(code); // Cache code version sent to AI

    try {
      if (activeAction === "translate") {
        if (sourceLanguage === targetLanguage) {
          toast.error("Source and Target languages must be different for translation.");
          setLoading(false);
          return;
        }

        setVerificationStatus({
          stage: "QUEUED",
          percent: 10,
          message: "Enqueuing translation task to async worker queue...",
        });

        const jobData = await translateAndVerifyAsync(code, sourceLanguage, targetLanguage);

        connectToJobStream(jobData.jobId, {
          onProgress: (progress) => {
            setVerificationStatus((prev) => ({
              ...prev,
              stage: progress.stage,
              percent: progress.percent,
              message: progress.message,
            }));
          },
          onCompleted: (returnvalue) => {
            setResult(returnvalue.result);
            setVerificationStatus({
              stage: returnvalue.verified ? "VERIFIED" : "COMPLETED_UNVERIFIED",
              percent: 100,
              message: returnvalue.verified
                ? `Verified! Passed unit assertions after ${returnvalue.iterations} self-healing iteration(s).`
                : "Completed (sandbox assertions did not pass).",
              verified: returnvalue.verified,
              iterations: returnvalue.iterations,
              testOutput: returnvalue.testOutput,
            });
            setLoading(false);
            if (returnvalue.verified) {
              toast.success(`Translation verified and passed all assertions!`);
            } else {
              toast.error("Translation complete, but some assertions failed.");
            }
          },
          onFailed: (failedReason) => {
            setLoading(false);
            setVerificationStatus({
              stage: "FAILED",
              percent: 100,
              message: failedReason || "Execution worker failed.",
              testOutput: failedReason,
            });
            toast.error(failedReason || "Translation job failed");
          },
          onError: () => {
            setLoading(false);
          },
        });
        return;
      }

      let response;
      if (activeAction === "analyze") {
        response = await analyzeComplexity(code, sourceLanguage);
      } else if (activeAction === "optimize") {
        response = await optimizeCode(code, sourceLanguage);
      } else if (activeAction === "explain") {
        response = await explainCode(code, sourceLanguage);
      }

      setResult(response);
      toast.success("AI analysis complete!");
      setLoading(false);
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

  const processUploadedFile = async (file) => {
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
      setVerificationStatus(null);
      setShowLogs(false);
    } catch (err) {
      toast.error("Failed to read script file.");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFilePickerChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processUploadedFile(e.target.files[0]);
      e.target.value = ""; // Reset file picker selection
    }
  };

  // Enhancement: Script Output Downloader
  const handleDownload = () => {
    if (!result) return;

    let displayResult = result;
    if (activeAction !== "translate") {
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
            <CustomSelect
              value={sourceLanguage}
              onChange={handleSourceChange}
              options={LANGUAGES}
            />
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
              <CustomSelect
                value={targetLanguage}
                onChange={handleTargetChange}
                options={LANGUAGES}
              />
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

      {/* Sandboxed Verification Pipeline Banner - Persistent across top during and after compilation */}
      {activeAction === "translate" && verificationStatus && (
        <VerificationPipeline 
          status={verificationStatus} 
          onClose={() => setVerificationStatus(null)} 
        />
      )}

      {/* Editor Grid Workspace */}
      <main className="workspace-grid">
        {loading && activeAction !== "translate" && (
          <div className="loading-overlay">
            <div className="spinner" style={{ width: "40px", height: "40px", borderTopColor: "#ffffff", borderWidth: "3px" }}></div>
            <p className="loading-text">AI is analyzing...</p>
          </div>
        )}

        {/* Left Pane - Input Code */}
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
            <div className="pane-header-actions">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="header-action-btn"
                title="Select a local script file to populate input"
              >
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFilePickerChange}
              />
            </div>
          </div>
          <div className="pane-content" style={{ position: "relative" }}>
            <CodeEditor 
              value={code} 
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

        {/* Right Pane - AI Output */}
        <section className="pane pane-right" style={{ flex: 1 }}>
          <div className="pane-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>AI Output</span>
              {verificationStatus && result && activeAction === "translate" && (
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.45rem",
                  borderRadius: "4px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: verificationStatus.verified ? "var(--text-primary)" : "var(--text-muted)",
                  letterSpacing: "0.03em"
                }}>
                  {verificationStatus.verified ? "✓ Verified" : "Unverified"}
                  {verificationStatus.iterations > 0 && ` (${verificationStatus.iterations} repair)`}
                </span>
              )}
            </div>

            <div className="pane-header-actions">
              {result && (
                <>
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    className={`header-action-btn ${showDiff ? "active" : ""}`}
                    title="Toggle original vs compiled side-by-side comparison"
                  >
                    {showDiff ? "Output View" : "Diff View"}
                  </button>
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
                </>
              )}
            </div>
          </div>

          <div className="pane-content">
            {loading && activeAction === "translate" ? (
              <div className="loading-state" style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <div className="spinner" style={{ width: "32px", height: "32px", borderTopColor: "var(--text-primary)", borderWidth: "2px" }}></div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "500" }}>
                  Sandboxed worker is compiling & verifying assertions...
                </p>
              </div>
            ) : (
              <OutputPanel 
                key="primary-output-panel"
                result={result} 
                action={activeAction} 
                targetLanguage={targetLanguage} 
                showDiff={showDiff}
                originalCode={sentCode}
                sourceLanguage={sourceLanguage}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;