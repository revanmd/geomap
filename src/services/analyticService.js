import api from "./api"; // Import the Axios instance

export const analyticService = {
  // Get all markers
  getLeaderboard: async () => {
    try {
      const response = await api.get("/api/analytics/leaderboard/hst");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch leaderboard" };
    }
  },
};
