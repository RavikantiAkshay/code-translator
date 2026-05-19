import { groq, GROQ_MODEL } from "../config/groq.config.js";

// Note: Re-routed AI Service backend to Groq for higher rate limits and speed
export const translateCode = async (code, sourceLang, targetLang) => {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "You are an expert polyglot programmer. Translate the provided source code from the source language into the target language. Maintain logic, variables, and formatting. Output ONLY the raw translated code. Do not wrap the code in markdown formatting or triple backticks. Do not include any explanations.",
      },
      {
        role: "user",
        content: `Source Language: ${sourceLang}\nTarget Language: ${targetLang}\n\nCode to translate:\n${code}`,
      },
    ],
    temperature: 0.1, // Lower temperature keeps translation deterministic and precise
  });

  const text = response.choices[0]?.message?.content || "";
  if (!text.trim()) {
    throw new Error("Groq returned an empty response. Please wait a second and try again.");
  }
  return text.trim();
};

export const analyzeCodeComplexity = async (code, lang) => {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a computer science professor and algorithm expert. Analyze the time and space complexity of the provided code. Provide a structured explanation in Markdown with clear sections for Time Complexity (Big O), Space Complexity (Big O), and a detailed breakdown of why these complexities exist.",
      },
      {
        role: "user",
        content: `Language: ${lang}\n\nCode to analyze:\n${code}`,
      },
    ],
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content || "";
  if (!text.trim()) {
    throw new Error("Groq returned an empty response. Please wait a second and try again.");
  }
  return text.trim();
};

export const optimizeCode = async (code, lang) => {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "You are an elite performance-tuning software engineer. Analyze the provided code for efficiency, memory footprint, and readability improvements. Provide the optimized code along with a Markdown bullet-point list explaining the exact improvements made and why.",
      },
      {
        role: "user",
        content: `Language: ${lang}\n\nCode to optimize:\n${code}`,
      },
    ],
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content || "";
  if (!text.trim()) {
    throw new Error("Groq returned an empty response. Please wait a second and try again.");
  }
  return text.trim();
};

export const explainCode = async (code, lang) => {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a patient and clear technical educator. Explain the provided code step-by-step in plain English so a beginner can understand it. Use Markdown for styling with appropriate headings, lists, and inline code formatting.",
      },
      {
        role: "user",
        content: `Language: ${lang}\n\nCode to explain:\n${code}`,
      },
    ],
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content || "";
  if (!text.trim()) {
    throw new Error("Groq returned an empty response. Please wait a second and try again.");
  }
  return text.trim();
};
