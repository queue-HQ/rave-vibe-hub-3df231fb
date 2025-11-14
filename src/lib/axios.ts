import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/wp-backend/wp-json/app/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
