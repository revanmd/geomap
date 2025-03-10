"use client"

import React, { createContext, useState, useContext } from "react";
import { motion } from "framer-motion";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Create context
const LoadingContext = createContext();

// Provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState("");

  // Function to start loading with custom message
  const showLoading = (message = "Loading...") => {
    setLoadingContent(message);
    setIsLoading(true);
  };

  // Function to stop loading
  const hideLoading = () => {
    setIsLoading(false);
    setLoadingContent("");
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}

      {/* Loading Screen with dynamic content */}
      {isLoading && (
        <motion.div
          className="loading-container text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "white" }} spin />} />
            <div className="text-xs text-white mt-3" style={{ lineHeight: "18px" }}>
              {loadingContent}
            </div>
          </div>
        </motion.div>
      )}
    </LoadingContext.Provider>
  );
};

// Custom hook to use loading functions
export const useLoading = () => useContext(LoadingContext);
