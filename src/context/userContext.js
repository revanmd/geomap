'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user data on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user from server (cookie-based auth)
        const userData = await authService.getUserByCookie();
        
        if (userData?.data) {
          console.log(userData) 
          setUser(userData.data?.user);
          setIsAuthenticated(true);
        } else {
          console.log(userData)
          clearUserState();
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
        setError('Failed to load user data');
        clearUserState();
      } finally {
        setLoading(false);
      }
    };
    initializeUser();
  }, []);

  // Helper function to clear user state
  const clearUserState = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Function to set user data
  const setUserData = (userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
    setError(null);
  };

  // Function to update user data
  const updateUserData = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    setError(null);
  };

  // Function to clear user data
  const clearUser = () => {
    clearUserState();
  };

  // Function to refresh user data from server
  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authService.getUser();
      
      if (userData?.data) {
        setUser(userData.data);
        setIsAuthenticated(true);
      } else {
        clearUserState();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setError('Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  };

  // Utility function to get specific user data
  const getUserData = (key) => {
    return user?.[key] || null;
  };

  // Utility function to check user type
  const isUserType = (type) => {
    return user?.user_type?.toLowerCase() === type.toLowerCase();
  };

  // Context value
  const contextValue = {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    
    // Functions
    setUser: setUserData,
    updateUser: updateUserData,
    clearUser,
    refreshUser,
    getUserData,
    isUserType,
    
    // Additional utility properties for easier access
    username: user?.username || null,
    userType: user?.user_type || null,
    userRegionCode: user?.user_region_code || null
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};

// HOC for components that require authentication
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useUser();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
}; 