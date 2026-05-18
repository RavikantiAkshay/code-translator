import { ai, GEMINI_MODEL } from "../config/gemini.config.js";

export const translateCode = async (code, sourceLang, targetLang) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      `Source Language: ${sourceLang}\nTarget Language: ${targetLang}\n\nCode to translate:\n${code}`
    ],
    config: {
      systemInstruction: "You are an expert polyglot programmer. Translate the provided source code from the source language into the target language. Maintain logic, variables, and formatting. Output ONLY the raw translated code. Do not wrap the code in markdown formatting or triple backticks. Do not include any explanations.",
    },
  });

  const text = response.text || "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response. This might be due to temporary server load or safety filters.");
  }
  return text.trim();
};

export const analyzeCodeComplexity = async (code, lang) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      `Language: ${lang}\n\nCode to analyze:\n${code}`
    ],
    config: {
      systemInstruction: "You are a computer science professor and algorithm expert. Analyze the time and space complexity of the provided code. Provide a structured explanation in Markdown with clear sections for Time Complexity (Big O), Space Complexity (Big O), and a detailed breakdown of why these complexities exist.",
    },
  });

  const text = response.text || "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response. This might be due to temporary server load or safety filters.");
  }
  return text.trim();
};

export const optimizeCode = async (code, lang) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      `Language: ${lang}\n\nCode to optimize:\n${code}`
    ],
    config: {
      systemInstruction: "You are an elite performance-tuning software engineer. Analyze the provided code for efficiency, memory footprint, and readability improvements. Provide the optimized code along with a Markdown bullet-point list explaining the exact improvements made and why.",
    },
  });

  const text = response.text || "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response. This might be due to temporary server load or safety filters.");
  }
  return text.trim();
};

export const explainCode = async (code, lang) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      `Language: ${lang}\n\nCode to explain:\n${code}`
    ],
    config: {
      systemInstruction: "You are a patient and clear technical educator. Explain the provided code step-by-step in plain English so a beginner can understand it. Use Markdown for styling with appropriate headings, lists, and inline code formatting.",
    },
  });

  const text = response.text || "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response. This might be due to temporary server load or safety filters.");
  }
  return text.trim();
};
