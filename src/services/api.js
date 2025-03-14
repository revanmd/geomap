import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Ensure the correct backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensures cookies are sent with requests
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;