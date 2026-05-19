import * as historyService from "../services/history.service.js";

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Check if query offset variables are supplied, otherwise fallback to retrieve all records
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const skip = (page - 1) * limit;

      const { history, total } = await historyService.getUserHistoryPaginated(userId, skip, limit);
      return res.json({
        success: true,
        data: history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Default legacy support (retrieve all)
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
