import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getHistory, deleteHistoryItem, clearHistory } from "../services/historyService.js";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";

import "../styles/history.css";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent expanding the card when clicking delete
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await deleteHistoryItem(id);
      setHistory(history.filter((item) => item._id !== id));
      toast.success("History item deleted.");
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete history item.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your entire translation history? This cannot be undone.")) return;

    try {
      await clearHistory();
      setHistory([]);
      toast.success("History cleared successfully!");
      setExpandedId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear history.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatAction = (action) => {
    switch (action) {
      case "translate":
        return "Translation";
      case "analyze":
        return "Complexity Analysis";
      case "optimize":
        return "Code Optimization";
      case "explain":
        return "Code Explanation";
      default:
        return action;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <div className="spinner" style={{ width: "36px", height: "36px", borderTopColor: "#38bdf8" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>Your History</h1>
        {history.length > 0 && (
          <button onClick={handleClearAll} className="clear-btn">
            Clear All History
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="no-history-state">
          <p>No translation logs found.</p>
          <Link to="/" className="no-history-link">
            Start Translating
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const isExpanded = expandedId === item._id;
            return (
              <article key={item._id} className="history-card">
                {/* Summary Header of Card */}
                <div className="card-summary" onClick={() => toggleExpand(item._id)}>
                  <div className="card-meta">
                    <span className={`action-badge badge-${item.action}`}>
                      {formatAction(item.action)}
                    </span>
                    <span className="lang-flow">
                      {item.sourceLanguage.toUpperCase()}
                      {item.action === "translate" && ` → ${item.targetLanguage.toUpperCase()}`}
                    </span>
                    <span className="time-stamp">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="card-actions">
                    <button className="expand-toggle-btn">
                      {isExpanded ? "Collapse" : "Expand Details"}
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, item._id)}
                      className="delete-item-btn"
                      title="Delete Record"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="card-details">
                    <div className="detail-grid">
                      <div className="detail-section">
                        <h4>Source Snippet ({item.sourceLanguage})</h4>
                        <div className="detail-editor">
                          <CodeEditor
                            code={item.sourceCode}
                            onChange={() => {}}
                            language={item.sourceLanguage}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>
                          {item.action === "translate"
                            ? `Translated Code (${item.targetLanguage})`
                            : "AI Output"}
                        </h4>
                        <div style={{ flex: 1, height: "100%", overflow: "hidden" }}>
                          <OutputPanel
                            result={item.result}
                            action={item.action}
                            targetLanguage={item.targetLanguage || item.sourceLanguage}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
