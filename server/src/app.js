import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Health check endpoint for Render Keep-Alive
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Routes
app.use("/api", routes);

// Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
