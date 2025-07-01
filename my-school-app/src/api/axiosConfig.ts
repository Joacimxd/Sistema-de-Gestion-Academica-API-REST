import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"; // O la URL de tu backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // O de donde guardes el token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación (ej. token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Manejar desautenticación, redirigir a login, limpiar token, etc.
      console.error("Unauthorized: Token expirado o inválido");
      localStorage.removeItem("authToken");
      // history.push('/login'); // Si usas react-router-dom
    }
    return Promise.reject(error);
  }
);

export default api;
