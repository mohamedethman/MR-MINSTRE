import api, { setAuthToken } from "./api";

interface LoginData {
  username: string;
  password: string;
}

export const login = async (username: string, password: string) => {
  const response = await api.post("/auth/login", { username, password });
  const token = response.data.token;

  // Save token in memory
  setAuthToken(token);

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
