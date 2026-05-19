import History from "../models/History.model.js";

export const createHistory = async (userId, action, sourceLanguage, targetLanguage, sourceCode, result) => {
  return await History.create({
    userId,
    action,
    sourceLanguage,
    targetLanguage,
    sourceCode,
    result,
  });
};

export const getUserHistory = async (userId) => {
  return await History.find({ userId }).sort({ createdAt: -1 });
};

// Enhancement: Database paginated query for transaction log scaling
export const getUserHistoryPaginated = async (userId, skip, limit) => {
  const [history, total] = await Promise.all([
    History.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    History.countDocuments({ userId }),
  ]);
  return { history, total };
};

export const deleteHistoryById = async (userId, historyId) => {
  const record = await History.findOneAndDelete({ _id: historyId, userId });
  if (!record) {
    const error = new Error("History record not found.");
    error.statusCode = 404;
    throw error;
  }
  return record;
};

export const clearUserHistory = async (userId) => {
  return await History.deleteMany({ userId });
};
