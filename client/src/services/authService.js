import API from "./api.js";

export const register = async (name, email, password) => {
  const response = await API.post("/auth/register", { name, email, password });
  return response.data.data;
};

export const emailLogin = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data.data;
};

export const googleLogin = async (credential) => {
  const response = await API.post("/auth/google", { credential });
  return response.data.data;
};

export const getMe = async () => {
  const response = await API.get("/auth/me");
  return response.data.data;
};

export const logout = async () => {
  const response = await API.post("/auth/logout");
  return response.data.data;
};
