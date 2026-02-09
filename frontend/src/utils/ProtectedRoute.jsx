import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Redirect based on user's actual role
    if (role === "Admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/courses" replace />;
    }
  }

  return children;
}


