import React, { useState } from "react";
import "../styles/verification.css";

const STAGES = [
  { id: "QUEUED", label: "Queue", desc: "BullMQ / Redis" },
  { id: "TRANSLATING", label: "Translate", desc: "LLM Code Gen" },
  { id: "GENERATING_TESTS", label: "Test Harness", desc: "Unit Assertions" },
  { id: "SANDBOX_COMPILING", label: "Sandbox Run", desc: "Isolated Kernel" },
  { id: "SELF_HEALING", label: "Self-Healing", desc: "Compiler Repair" },
  { id: "VERIFIED", label: "Verified", desc: "Tests Passing" },
];

export default function VerificationPipeline({ status, onClose }) {
  const [showLogs, setShowLogs] = useState(true);

  if (!status) return null;

  const {
    stage = "QUEUED",
    percent = 10,
    message = "Job pending in queue...",
    verified,
    iterations = 0,
    testOutput,
  } = status;

  const currentStageIndex = STAGES.findIndex((s) => {
    if (stage.startsWith("HEALING")) return s.id === "SELF_HEALING";
    return s.id === stage;
  });

  const isComplete = stage === "VERIFIED" || stage === "COMPLETED_UNVERIFIED";

  return (
    <div className="verification-pipeline-banner">
      {/* Top Bar */}
      <div className="pipeline-top-bar">
        <div className="pipeline-title-group">
          <span className="pipeline-pulse-dot" data-active={!isComplete} />
          <h4>Sandboxed Execution & Verification Pipeline</h4>
          <span className="pipeline-status-badge" data-verified={verified ? "true" : "false"}>
            {verified ? "✓ Verified Passing" : stage}
          </span>
          {iterations > 0 && (
            <span className="pipeline-iteration-badge">
              ↺ {iterations} self-healing iteration{iterations > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="pipeline-actions-group">
          {testOutput && (
            <button
              type="button"
              className="pipeline-toggle-btn"
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? "Hide Terminal Logs" : "Show Terminal Logs"}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="pipeline-dismiss-btn"
              onClick={onClose}
              title="Dismiss Pipeline Banner"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="pipeline-track">
        <div
          className="pipeline-bar"
          style={{ width: `${Math.min(Math.max(percent, 8), 100)}%` }}
        />
      </div>

      {/* Stepper Grid */}
      <div className="pipeline-steps-grid">
        {STAGES.map((step, idx) => {
          let stepState = "pending";
          if (idx < currentStageIndex || isComplete) stepState = "done";
          if (idx === currentStageIndex && !isComplete) stepState = "active";
          if (step.id === "SELF_HEALING" && iterations > 0) stepState = "healed";

          return (
            <div key={step.id} className={`pipeline-step-item ${stepState}`}>
              <div className="step-bubble">
                {stepState === "done" ? (
                  "✓"
                ) : stepState === "healed" ? (
                  `↺${iterations}`
                ) : (
                  idx + 1
                )}
              </div>
              <span className="step-title">{step.label}</span>
              <span className="step-desc">{step.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Activity Status Message */}
      <div className="pipeline-status-row">
        <span className="status-label">Status</span>
        <span className="status-message">{message}</span>
      </div>

      {/* Embedded Terminal Output Stream */}
      {testOutput && showLogs && (
        <div className="pipeline-terminal-box">
          <div className="terminal-header">
            <span>SANDBOX EXECUTION LOGS</span>
            {verified && <span className="terminal-pass-tag">✓ ALL ASSERTIONS PASSED</span>}
          </div>
          <pre className="terminal-pre">{testOutput}</pre>
        </div>
      )}
    </div>
  );
}
