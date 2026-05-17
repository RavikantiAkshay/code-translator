import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes and error handlers will be added here in later phases

export default app;
