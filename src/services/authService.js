import axios from "axios";
import api from "./api";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post(
        "/api/users/_login",
        { username, password }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  logout: async () => {
    try {
      await api.delete("/api/users/_logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  getUser: async () => {
    try {
      const response = await api.patch("/api/users/_current");
      return response.data; 
    } catch (error) {
      return null; 
    }
  },

  getUserByCookie: async () => {
    try {
      const response = await axios.get("api/auth/getUser");
      return response.data; 
    } catch (error) {
      return null; 
    }
  },

  checkAuthStatus: async () => {
    try {
      const response = await api.get("/api/users/_me");
      return response.data; // Returns user data if authenticated
    } catch (error) {
      return null; // User is not authenticated
    }
  },
};
