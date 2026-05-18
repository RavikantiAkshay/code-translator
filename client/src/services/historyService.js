import API from "./api.js";

export const getHistory = async () => {
  const response = await API.get("/history");
  return response.data.data;
};

export const deleteHistoryItem = async (id) => {
  const response = await API.delete(`/history/${id}`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await API.delete("/history");
  return response.data;
};
