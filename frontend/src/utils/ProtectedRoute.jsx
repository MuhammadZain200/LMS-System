import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    // Support comma-separated string or array of roles
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : requiredRole.split(",").map((r) => r.trim());

    if (!allowedRoles.includes(role)) {
      // Redirect based on user's actual role
      if (role === "Admin") {
        return <Navigate to="/admin-dashboard" replace />;
      } else {
        return <Navigate to="/courses" replace />;
      }
    }
  }

  return children;
}


