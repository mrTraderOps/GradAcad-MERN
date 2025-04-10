import axios from "axios";

export const baseURL = "https://gradacad-mern.onrender.com";
// "http://localhost:5000"

const API = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

// Attach token before every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API
