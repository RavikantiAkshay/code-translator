import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function HistoryPage() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      <h1>Translation History</h1>
      <p>Hello, {user?.name}. Your saved code translations will show up here.</p>
      <p>This is a temporary placeholder for the History workspace.</p>
    </div>
  );
}

export default HistoryPage;
