import axios from "axios";

const localURL = "http://localhost:5000"
const cloudURL = "https://gradacad-mern.onrender.com"

const API = axios.create({
  baseURL: `${localURL}/api/v1`,
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
