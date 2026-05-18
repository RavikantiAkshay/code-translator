import * as historyService from "../services/history.service.js";

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await historyService.getUserHistory(userId);
    return res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    await historyService.deleteHistoryById(userId, id);
    return res.json({ success: true, message: "History record deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await historyService.clearUserHistory(userId);
    return res.json({ success: true, message: "All history records cleared successfully." });
  } catch (error) {
    next(error);
  }
};
