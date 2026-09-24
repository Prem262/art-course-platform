import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [user, setUser] = useState(() => authService.getCurrentUser());

  useEffect(() => {
    const authStatus = authService.isAuthenticated();
    setIsAuthenticated(authStatus);
    if (authStatus) {
      setUser(authService.getCurrentUser());
    }
  }, []);

  const login = (email, password) => {
    const result = authService.login(email, password);
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(authService.getCurrentUser());
  };

  const switchUser = (userId) => {
    const switched = authService.switchUser(userId);
    if (switched) {
      setUser(switched);
      setIsAuthenticated(true);
    }
    return switched;
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        student: user, // For backwards compatibility with components referencing student
        isAdmin,
        isStudent,
        login,
        logout,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
