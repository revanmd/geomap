import axios from "axios";
import { authService } from "./authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Ensure the correct backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensures cookies are sent with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      if (typeof window !== "undefined") {

        const clearAuth = async () => {
          try {
            
            await fetch("/api/auth/clear");
            await authService.logout()
          } catch (error) {
            console.error("Auth clear failed", error);
          } 
        };
        clearAuth()
        setTimeout(()=>{
          window.location.href = "/";
        },1000)
      }
    }
    return Promise.reject(error);
  }
);


export default api;