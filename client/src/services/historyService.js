import API from "./api.js";

export const getHistory = async (page = null, limit = null) => {
  let url = "/history";
  if (page !== null && limit !== null) {
    url += `?page=${page}&limit=${limit}`;
  }
  const response = await API.get(url);
  // Return the raw response body so components can read both .data items and .pagination parameters
  return response.data;
};

export const deleteHistoryItem = async (id) => {
  const response = await API.delete(`/history/${id}`);
  return response.data;
};

export const clearHistory = async (id) => {
  const response = await API.delete("/history");
  return response.data;
};
