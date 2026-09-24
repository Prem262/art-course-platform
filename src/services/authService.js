import { mockStudent, mockStudents, mockAdmin, allMockUsers } from '../data/users';

const AUTH_STORAGE_KEY = "isAuthenticated";
const USER_STORAGE_KEY = "currentUser";

export const authService = {
  login: (email, password) => {
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    // Admin login
    if (cleanEmail === "admin@demo.com" && cleanPassword === "admin123") {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockAdmin));
      } catch (e) {
        console.error("Failed to access localStorage", e);
      }
      return { success: true, user: mockAdmin };
    }

    // Student 1 login (supports student1@demo.com or student@demo.com)
    if ((cleanEmail === "student1@demo.com" || cleanEmail === "student@demo.com") && cleanPassword === "demo123") {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockStudent));
      } catch (e) {
        console.error("Failed to access localStorage", e);
      }
      return { success: true, user: mockStudent };
    }

    // Other students (Student 2, 3, 4)
    const matchedStudent = mockStudents.find(
      s => s.email.toLowerCase() === cleanEmail && cleanPassword === "demo123"
    );
    if (matchedStudent) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(matchedStudent));
      } catch (e) {
        console.error("Failed to access localStorage", e);
      }
      return { success: true, user: matchedStudent };
    }

    return {
      success: false,
      error: "Invalid email or password. Please check your credentials and try again."
    };
  },

  logout: () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to access localStorage", e);
    }
  },

  isAuthenticated: () => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
    } catch (e) {
      console.error("Failed to read localStorage", e);
      return false;
    }
  },

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to read user from localStorage", e);
    }
    return mockStudent;
  },

  // Backwards compatibility helper
  getCurrentStudent: () => {
    const user = authService.getCurrentUser();
    return user.role === 'admin' ? mockStudent : user;
  },

  switchUser: (userId) => {
    const targetUser = allMockUsers.find(u => u.id === userId);
    if (targetUser) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(targetUser));
      } catch (e) {
        console.error("Failed to switch user", e);
      }
      return targetUser;
    }
    return null;
  }
};
