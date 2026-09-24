import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { ExploreCoursesPage } from './pages/ExploreCoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPage } from './pages/LessonPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Only Route wrapper component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Root index redirector based on authentication and role
const RootRedirector = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LearningProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Root Route */}
              <Route path="/" element={<RootRedirector />} />

              {/* Login Page */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Application Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Specific Learning Progress Dashboard */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Separate My Enrolled Courses Page */}
                <Route path="/courses" element={<CoursesPage />} />

                {/* Explore & Buy Courses Store Page */}
                <Route path="/explore" element={<ExploreCoursesPage />} />

                {/* Course Details & Lessons */}
                <Route path="/course/:courseId" element={<CourseDetailPage />} />
                <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />

                {/* Admin Management Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  }
                />

                {/* 404 Catch All */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LearningProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
