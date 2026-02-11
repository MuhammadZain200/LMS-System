import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import CourseList from "./pages/CourseList";
import AddCourse from "./pages/AddCourse";
import EditCourse from "./pages/EditCourse";
import CourseDetails from "./pages/CourseDetails";
import MyCourses from "./pages/MyCourses";
import ProtectedRoute from "./utils/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect when we open URL */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-courses"
          element={
            <ProtectedRoute requiredRole="Admin">
              <CourseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-students"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-course"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AddCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-course/:id"
          element={
            <ProtectedRoute requiredRole="Admin">
              <EditCourse />
            </ProtectedRoute>
          }
        />

        {/* Student Routes (Student or Instructor) */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute requiredRole={"Student,Instructor"}>
              <CourseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-details/:id"
          element={
            <ProtectedRoute requiredRole={"Student,Instructor"}>
              <CourseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute requiredRole={"Student,Instructor"}>
              <MyCourses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
