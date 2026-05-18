import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function HomePage() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      <h1>Welcome to Code Translator!</h1>
      <p>Hello, {user?.name} (email: {user?.email})</p>
      <p>This is a temporary placeholder for the HomePage workspace.</p>
    </div>
  );
}

export default HomePage;