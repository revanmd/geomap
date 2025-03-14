import api from "./api";

export const userService = {
  current: async () => {
    try {
      const response = await api.patch(
        "/api/users/_current",
        {}
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Fetch current failed" };
    }
  },
};
