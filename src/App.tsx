// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import GroupsPage from "./pages/Groups";
import MoviesPage from "./pages/Movies";
import FeedbackPage from "./pages/Feedback";
import EditUserPage from "@/pages/EditUser"; // adjust path as needed



// Wrapper to protect authenticated routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
};

// flag 
const isDev = true; // Change to false in production

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />

        {/* Protected or Dev dashboard layout */}
        <Route
          path="/dashboard"
          element={
            isDev ? (
              <DashboardLayout />
            ) : (
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            )
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="feedback" element={<FeedbackPage />} />        
          <Route path="edit-user/:id" element={<EditUserPage />} />

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
