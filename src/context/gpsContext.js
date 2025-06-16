'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the GPS context
const GpsContext = createContext();

// Provider component
export const GpsProvider = ({ children }) => {
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsTimestamp, setGpsTimestamp] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);

  // Check if GPS data is fresh (within 30 seconds)
  const isGpsFresh = useCallback(() => {
    if (!gpsTimestamp || !gpsLocation) return false;
    const now = Date.now();
    const timeDiff = now - gpsTimestamp;
    return timeDiff < 30000; // 30 seconds in milliseconds
  }, [gpsTimestamp, gpsLocation]);

  // Update GPS location and timestamp
  const updateGpsLocation = useCallback((location) => {
    setGpsLocation(location);
    setGpsTimestamp(Date.now());
    setIsGpsActive(true);
  }, []);

  // Clear GPS data
  const clearGpsLocation = useCallback(() => {
    setGpsLocation(null);
    setGpsTimestamp(null);
    setIsGpsActive(false);
  }, []);

  // Get cached GPS location if fresh, null if stale or not available
  const getCachedGpsLocation = useCallback(() => {
    return isGpsFresh() ? gpsLocation : null;
  }, [isGpsFresh, gpsLocation]);

  // Check if GPS permission is granted based on localStorage
  const hasGpsPermission = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("gps_location") === "allowed";
    }
    return false;
  }, []);

  // Context value
  const contextValue = {
    // State
    gpsLocation,
    gpsTimestamp,
    isGpsActive,
    
    // Functions
    updateGpsLocation,
    clearGpsLocation,
    getCachedGpsLocation,
    isGpsFresh,
    hasGpsPermission,
    
    // Utility functions
    getAge: () => gpsTimestamp ? Date.now() - gpsTimestamp : null,
    isExpired: () => !isGpsFresh()
  };

  return (
    <GpsContext.Provider value={contextValue}>
      {children}
    </GpsContext.Provider>
  );
};

// Custom hook to use GPS context
export const useGps = () => {
  const context = useContext(GpsContext);
  
  if (context === undefined) {
    throw new Error('useGps must be used within a GpsProvider');
  }
  
  return context;
}; 