import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/wp-backend/wp-json/app/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");

  // 🔥 Check token expiration (10 minutes)
  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    window.location.href = "/"; // auto logout
    return Promise.reject("Token expired");
  }

  if (token) {
    config.headers.Authorization = token; // Backend expects raw token
  }

  return config;
});

export default api;
