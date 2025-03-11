import api from "./api"; // Import the Axios instance

export const fileService = {
  // Upload a file using FormData
  uploadFile: async (base64String, fileName = "image.png") => {
    try {
      // Convert base64 to Blob
      const file = await base64ToFile(base64String, fileName);

      // Create FormData and append file
      const formData = new FormData();
      formData.append("file", file); // Assuming API expects "file" field

      // Send request
      const response = await api.post("/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to upload file" };
    }
  },

  // Fetch a file by filename
  getFile: async (filename) => {
    try {
      const response = await api.get(`/file/${filename}`, {
        responseType: "blob", // Important for handling files
      });

      return response.data; // Blob data
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch file" };
    }
  },
};

// Function to convert base64 string to File object
const base64ToFile = (base64String, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      let arr = base64String.split(",");
      let mime = arr[0].match(/:(.*?);/)[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      let file = new File([u8arr], fileName, { type: mime });
      resolve(file);
    } catch (error) {
      reject(error);
    }
  });
};
