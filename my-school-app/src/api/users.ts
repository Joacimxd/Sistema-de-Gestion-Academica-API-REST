import api from "./axiosConfig";

export const userService = {
  getAllUsers: () => api.get("/usuarios"),
  getUserById: (id: string) => api.get(`/usuarios/${id}`),
  createUser: (userData: any) => api.post("/usuarios", userData),
  updateUser: (id: string, userData: any) =>
    api.put(`/usuarios/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/usuarios/${id}`),
};
