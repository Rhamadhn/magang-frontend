import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useAuth } from "./context/AuthContext";

// Layout & Common Components
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Core Pages
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";
import NotFound from "./pages/OtherPage/NotFound";

// Admin Domain Pages
import DivisionPage from "./pages/Organization/DivisionPage";
import KriteriaPage from "./pages/Organization/KriteriaPage";
import PlottingPage from "./pages/Organization/PlottingPage";
import InternManagement from "./pages/users/InternManagement";
import MentorManagement from "./pages/users/MentorManagement";

// Mentor Domain Pages
import MyInternsPage from "./pages/Mentor/MyInternsPage";
import TaskManagement from "./pages/TaskManagement";

// Intern Domain Pages
import LogbookPage from "./pages/logbook/LogbookPage";
import TaskPage from "./pages/task/TaskPage";

// Shared/Feature Pages
import EvaluationPage from "./pages/Evaluation/EvaluationPage";
import InternEvaluationPage from "./pages/Evaluation/InternEvaluationPage";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* =========================================================================
              1. PUBLIC ROUTES
             ========================================================================= */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* =========================================================================
              2. PROTECTED ROUTES (GLOBAL LAYOUT)
             ========================================================================= */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRoles={["admin", "mentor", "intern"]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* General Routes */}
            <Route index element={<Home />} />
            <Route path="profile" element={<UserProfiles />} />

            {/* --- ADMIN ONLY ROUTES --- */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserProfiles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="Organization" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DivisionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="kriteria-management" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <KriteriaPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="placement" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PlottingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="users/internship" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <InternManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="users/mentor" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MentorManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* --- MENTOR ONLY ROUTES --- */}
            <Route 
              path="intern-list" 
              element={
                <ProtectedRoute allowedRoles={["mentor"]}>
                  <MyInternsPage /> 
                </ProtectedRoute>
              } 
            />
            <Route 
              path="task-management" 
              element={
                <ProtectedRoute allowedRoles={["mentor"]}>
                  <TaskManagement />
                </ProtectedRoute>
              } 
            />

            {/* --- INTERN ONLY ROUTES --- */}
            <Route 
              path="task" 
              element={
                <ProtectedRoute allowedRoles={["intern"]}>
                  <TaskPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="logbook" 
              element={
                <ProtectedRoute allowedRoles={["intern"]}>
                  <LogbookPage />
                </ProtectedRoute>
              } 
            />

            {/* --- SHARED DYNAMIC ROUTES (MENTOR & INTERN) --- */}
            <Route 
              path="evaluation" 
              element={
                <ProtectedRoute allowedRoles={["mentor", "intern"]}>
                  {user?.role === "mentor" ? <EvaluationPage /> : <InternEvaluationPage />}
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* =========================================================================
              3. REDIRECTS & FALLBACK ROUTES
             ========================================================================= */}
          <Route path="/TailAdmin/signin" element={<Navigate to="/signin" replace />} />
          <Route path="/TailAdmin/signup" element={<Navigate to="/signup" replace />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}