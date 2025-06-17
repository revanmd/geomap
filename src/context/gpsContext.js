'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the GPS context
const GpsContext = createContext();

// Provider component
export const GpsProvider = ({ children }) => {
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsTimestamp, setGpsTimestamp] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

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
    setIsGpsLoading(false);
  }, []);

  // Clear GPS data
  const clearGpsLocation = useCallback(() => {
    setGpsLocation(null);
    setGpsTimestamp(null);
    setIsGpsActive(false);
    setIsGpsLoading(false);
  }, []);

  // Get cached GPS location if fresh, null if stale or not available
  const getCachedGpsLocation = useCallback(() => {
    return isGpsFresh() ? gpsLocation : null;
  }, [isGpsFresh, gpsLocation]);

  // Force get current GPS position
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setIsGpsLoading(true);

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          setIsGpsLoading(false);
          reject(new Error('GPS timeout: Could not get location within 20 seconds'));
        }, 20000); // 20 seconds timeout
      });

      // Create the geolocation promise
      const geoPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            updateGpsLocation(location);
            resolve(location);
          },
          (error) => {
            setIsGpsLoading(false);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000, // Match the timeout promise
            maximumAge: 0 // This ensures we get a fresh position
          }
        );
      });

      // Race between timeout and geolocation
      Promise.race([geoPromise, timeoutPromise])
        .then(resolve)
        .catch((error) => {
          setIsGpsLoading(false);
          reject(error);
        });
    });
  }, [updateGpsLocation]);

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
    isGpsLoading,
    
    // Functions
    updateGpsLocation,
    clearGpsLocation,
    getCachedGpsLocation,
    isGpsFresh,
    hasGpsPermission,
    getCurrentPosition,
    
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