import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

export default function AdminDashboard() {
  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage courses, view statistics, and oversee the learning platform.
          </p>
        </div>

        <div className="dashboard-actions">
          <Link to="/admin-courses" className="dashboard-card">
            <div className="dashboard-card-icon">📚</div>
            <h2 className="dashboard-card-title">Manage Courses</h2>
            <p className="dashboard-card-description">
              View, add, edit, and delete courses
            </p>
          </Link>

          <Link to="/add-course" className="dashboard-card">
            <div className="dashboard-card-icon">➕</div>
            <h2 className="dashboard-card-title">Add New Course</h2>
            <p className="dashboard-card-description">
              Create a new course for students
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}


