import api from "./api"; // Import the Axios instance

export const markerService = {
  // Create a new marker
  createMarker: async (markerData) => {
    try {
      const response = await api.post("/api/markers", markerData);
      return response.data;
    } catch (error) {
      console.error("Create marker error:", error);
      throw error.response?.data || { message: "Failed to create marker" };
    }
  },

  // Get all markers
  getMarkers: async () => {
    try {
      const response = await api.get("/api/markers");
      return response.data;
    } catch (error) {
      console.error("Get markers error:", error);
      throw error.response?.data || { message: "Failed to fetch markers" };
    }
  },

  // Get all markers
  getSelfMarkers: async () => {
    try {
      const response = await api.get("/api/markers/_self");
      return response.data;
    } catch (error) {
      console.error("Get self markers error:", error);
      throw error.response?.data || { message: "Failed to fetch markers" };
    }
  },

  // Get a single marker by ID
  getMarkerById: async (markerId) => {
    if (!markerId) {
      throw new Error("Marker ID is required");
    }
    try {
      const response = await api.get(`/api/markers/${markerId}`);
      if (!response.data) {
        throw new Error("No data returned from server");
      }
      return response.data;
    } catch (error) {
      console.error("Get marker by ID error:", error);
      if (error.response?.status === 404) {
        throw { message: "Marker tidak ditemukan" };
      }
      throw error.response?.data || { message: "Failed to fetch marker" };
    }
  },

  // Update a marker by ID
  updateMarker: async (markerId, markerData) => {
    if (!markerId) {
      throw new Error("Marker ID is required");
    }
    try {
      const response = await api.put(`/api/markers/${markerId}`, markerData);
      return response.data;
    } catch (error) {
      console.error("Update marker error:", error);
      throw error.response?.data || { message: "Failed to update marker" };
    }
  },

  // Delete a marker by ID
  deleteMarker: async (markerId) => {
    if (!markerId) {
      throw new Error("Marker ID is required");
    }
    try {
      const response = await api.delete(`/api/markers/${markerId}`);
      return response.data;
    } catch (error) {
      console.error("Delete marker error:", error);
      throw error.response?.data || { message: "Failed to delete marker" };
    }
  },

  summary: async () => {
    try {
      const response = await api.get(`/api/markers/_summary`);
      return response.data;
    } catch (error) {
      console.error("Get summary error:", error);
      throw error.response?.data || { message: "Failed to get summary" };
    }
  },

  checkRadius: async (radiusData) => {
    try {
      const response = await api.post(`/api/markers/_check-radius`, radiusData);
      return response.data;
    } catch (error) {
      console.error("Check radius error:", error);
      throw error.response?.data || { message: "Failed to check radius" };
    }
  },
};
