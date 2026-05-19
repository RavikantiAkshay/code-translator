import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY is not defined in the environment variables.");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// High-capacity, robust reasoning and fast model on Groq
export const GROQ_MODEL = "llama-3.3-70b-versatile";
