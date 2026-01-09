import axios from "axios";

const api = axios.create({
  baseURL: "https://admin-dashboard-for-main-website.onrender.com",
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
    if (error.response && error.response.status === 401) {
      console.warn("Token expired. Logging out...");
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
