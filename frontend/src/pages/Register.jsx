import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    setIsLoading(true);
    
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      
      // Registration successful - redirect to login
      alert("Registration successful! Please login with your credentials.");
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || "Registration failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-register">
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join our learning platform to access courses, track progress and
              more.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                className="auth-input"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="auth-helper-text">
                Must be at least 8 characters long.
              </p>

              <div className="auth-role-selection">
                <button
                  type="button"
                  className={`auth-role-btn ${
                    role === "Student" ? "active" : ""
                  }`}
                  onClick={() => setRole("Student")}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={`auth-role-btn ${
                    role === "Instructor" ? "active" : ""
                  }`}
                  onClick={() => setRole("Instructor")}
                >
                  Instructor
                </button>
              </div>

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>

              <button type="submit" className="auth-primary-btn">
                {isLoading ? "Creating Account..." : "Register Account"}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-footer-link">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}