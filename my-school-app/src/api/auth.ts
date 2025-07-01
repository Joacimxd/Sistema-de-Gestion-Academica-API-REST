import api from "./axiosConfig";

export const authService = {
  login: (credentials: any) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
  validateToken: () => api.get("/auth/validate"),
  register: (userData: any) => api.post("/auth/register", userData),
};
