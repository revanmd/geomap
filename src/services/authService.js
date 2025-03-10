import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Set in .env.local

export const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/_login`, {
        username: username,
        password: password,
      });

      // Store token in localStorage or cookies
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },
};
