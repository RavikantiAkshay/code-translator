import * as geminiService from "../services/gemini.service.js";
import * as historyService from "../services/history.service.js";

export const handleTranslation = async (req, res, next) => {
  try {
    const { code, sourceLanguage, targetLanguage } = req.body;
    const userId = req.user._id;

    if (!code || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Code, sourceLanguage, and targetLanguage are required.",
      });
    }

    const result = await geminiService.translateCode(code, sourceLanguage, targetLanguage);
    
    // Automatically save to history
    await historyService.createHistory(
      userId,
      "translate",
      sourceLanguage,
      targetLanguage,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleComplexityAnalysis = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.analyzeCodeComplexity(code, language);

    // Automatically save to history
    await historyService.createHistory(
      userId,
      "analyze",
      language,
      null,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleOptimization = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.optimizeCode(code, language);

    // Automatically save to history
    await historyService.createHistory(
      userId,
      "optimize",
      language,
      null,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};

export const handleExplanation = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

    const result = await geminiService.explainCode(code, language);

    // Automatically save to history
    await historyService.createHistory(
      userId,
      "explain",
      language,
      null,
      code,
      result
    );

    return res.json({ success: true, data: { result } });
  } catch (error) {
    next(error);
  }
};
