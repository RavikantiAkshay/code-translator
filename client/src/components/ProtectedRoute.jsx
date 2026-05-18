import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        className="loading-state"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div className="spinner" style={{ width: "36px", height: "36px", borderTopColor: "#38bdf8" }}></div>
        <p style={{ fontSize: "0.95rem", color: "#94a3b8", fontWeight: "500" }}>
          Securing session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <div className="protected-shell">{children}</div>;
}

export default ProtectedRoute;