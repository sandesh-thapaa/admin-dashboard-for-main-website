import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// for the logout
export const logout = () => {
  localStorage.removeItem("access_token");
  window.location.href = "/";
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config.url === "/auth/login") {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      console.warn("Token expired or invalid, logging out...");
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
