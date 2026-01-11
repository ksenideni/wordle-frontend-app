import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthService from './service/AuthService';

// Auth components
import RegisterTeacher from './components/auth/RegisterTeacher';
import RegisterStudent from './components/auth/RegisterStudent';
import LoginTeacher from './components/auth/LoginTeacher';
import LoginStudent from './components/auth/LoginStudent';

// Teacher components
import TeacherDashboard from './components/teacher/TeacherDashboard';

// Student components
import StudentGame from './components/student/StudentGame';
import StudentRanking from './components/student/StudentRanking';

// Home component
import Home from './components/Home';

// Protected Route component
function ProtectedRoute({ children, requiredRole }) {
  const user = AuthService.getUser();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register/teacher" element={<RegisterTeacher />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/login/teacher" element={<LoginTeacher />} />
        <Route path="/login/student" element={<LoginStudent />} />

        {/* Teacher routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute requiredRole="teacher">
              <Navigate to="/teacher/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/dictionaries"
          element={
            <ProtectedRoute requiredRole="teacher">
              <Navigate to="/teacher/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/challenges"
          element={
            <ProtectedRoute requiredRole="teacher">
              <Navigate to="/teacher/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student/game"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/ranking"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentRanking />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
