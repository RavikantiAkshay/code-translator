import * as geminiService from "../services/gemini.service.js";

export const handleTranslation = async (req, res, next) => {
  try {
    const { code, sourceLanguage, targetLanguage } = req.body;
    if (!code || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Code, sourceLanguage, and targetLanguage are required.",
      });
    }

    const result = await geminiService.translateCode(code, sourceLanguage, targetLanguage);
    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleComplexityAnalysis = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.analyzeCodeComplexity(code, language);
    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleOptimization = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.optimizeCode(code, language);
    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleExplanation = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.explainCode(code, language);
    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};
