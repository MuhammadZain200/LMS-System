/**
 * Student & Instructor: Browse available courses
 * - View all courses with enrollment status, navigate to details to enroll
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/CourseList.css";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("/courses");
      setCourses(response.data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load courses");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-state">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="course-list-header">
          <h1 className="dashboard-title">Available Courses</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {courses.length === 0 ? (
          <div className="empty-state">
            <p>No courses available.</p>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-content">
                  <h2 className="course-card-title">{course.title}</h2>
                  <p className="course-card-description">{course.description}</p>
                  <div className="course-card-details">
                    <span className="course-card-detail">Duration: {course.duration} hours</span>
                    <span className="course-card-detail">Price: ${course.price}</span>
                    {course.enrolled && (
                      <span className="course-card-detail course-card-enrolled-badge">Enrolled</span>
                    )}
                  </div>
                </div>
                <div className="course-card-actions">
                  <Link to={`/course-details/${course.id}`} className="course-card-btn course-card-btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
