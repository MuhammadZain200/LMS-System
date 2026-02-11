import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("keepLoggedIn");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={role === "Admin" ? "/admin-dashboard" : "/courses"} className="navbar-logo">
          <span className="navbar-logo-icon" />
          <div className="navbar-logo-text">
            <span className="navbar-logo-title">Learning</span>
            <span className="navbar-logo-subtitle">Management Systems</span>
          </div>
        </Link>

        <div className="navbar-links">
          {role === "Admin" ? (
            <>
              <Link to="/admin-dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/admin-courses" className="navbar-link">
                Courses
              </Link>
              <Link to="/admin-students" className="navbar-link">
                Students
              </Link>
            </>
          ) : (
            <>
              <Link to="/courses" className="navbar-link">
                Courses
              </Link>
              <Link to="/my-courses" className="navbar-link">
                My Courses
              </Link>
            </>
          )}
          <button onClick={handleLogout} className="navbar-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}


