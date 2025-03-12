import api from "./api"; // Import the Axios instance

export const markerService = {
  // Create a new marker
  createMarker: async (markerData) => {
    try {
      const response = await api.post("/api/markers", markerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create marker" };
    }
  },

  // Get all markers
  getMarkers: async () => {
    try {
      const response = await api.get("/api/markers");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch markers" };
    }
  },

  // Get all markers
  getSelfMarkers: async () => {
    try {
      const response = await api.get("/api/markers/_self");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch markers" };
    }
  },


  // Get a single marker by ID
  getMarkerById: async (markerId) => {
    try {
      const response = await api.get(`/api/markers/${markerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch marker" };
    }
  },

  // Update a marker by ID
  updateMarker: async (markerId, markerData) => {
    try {
      const response = await api.put(`/api/markers/${markerId}`, markerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update marker" };
    }
  },

  // Delete a marker by ID
  deleteMarker: async (markerId) => {
    try {
      const response = await api.delete(`/api/markers/${markerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete marker" };
    }
  },


  summary: async () => {
    try {
      const response = await api.get(`/api/markers/_summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to get summary" };
    }
  },
};
