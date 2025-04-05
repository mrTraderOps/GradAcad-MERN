import axios from "axios";

export const API = axios.create({
  baseURL: `https://gradacad-mern.onrender.com/api/v1`,
});

// Attach token before every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
