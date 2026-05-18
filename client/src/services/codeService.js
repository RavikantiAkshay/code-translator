import API from "./api.js";

export const translateCode = async (code, sourceLanguage, targetLanguage) => {
  const response = await API.post("/code/translate", {
    code,
    sourceLanguage,
    targetLanguage,
  });
  return response.data.data.result;
};

export const analyzeComplexity = async (code, language) => {
  const response = await API.post("/code/complexity", { code, language });
  return response.data.data.result;
};

export const optimizeCode = async (code, language) => {
  const response = await API.post("/code/optimize", { code, language });
  return response.data.data.result;
};

export const explainCode = async (code, language) => {
  const response = await API.post("/code/explain", { code, language });
  return response.data.data.result;
};
