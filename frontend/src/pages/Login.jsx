import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      
      if (keepLoggedIn) {
        localStorage.setItem("keepLoggedIn", "true");
      }

      // Redirect based on role
      if (res.data.role === "Admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      alert(err.response?.data || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Please contact your administrator to reset your password.");
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-logo">
          <span className="auth-logo-icon" />
          <div className="auth-logo-text">
            <span className="auth-logo-title">Learning</span>
            <span className="auth-logo-subtitle">Management Systems</span>
          </div>
        </div>
      </header>

      <div className="auth-layout">
        <section className="auth-illustration">
          <div className="auth-illustration-panel">
            <div className="auth-illustration-laptop" />
            <div className="auth-illustration-person" />
            <div className="auth-illustration-lock" />
          </div>
        </section>

        <section className="auth-card-wrapper">
          <div className="auth-card">
            <h1 className="auth-title">Account Login</h1>
            <p className="auth-subtitle">
              If you are already a member you can login with your email address
              and password.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="auth-row auth-row-between">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="auth-primary-btn">
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="auth-footer-text">
              Don’t have an account?{" "}
              <Link to="/register" className="auth-footer-link">
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}