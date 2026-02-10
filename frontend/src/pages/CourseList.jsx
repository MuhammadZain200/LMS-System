import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/CourseList.css";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const isAdmin = role === "Admin";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/courses");
      setCourses(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await api.delete(`/Course/${courseId}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data || "Failed to delete course");
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
          <h1 className="dashboard-title">
            {isAdmin ? "Course Management" : "Available Courses"}
          </h1>
          {isAdmin && (
            <Link to="/add-course" className="course-list-add-btn">
              Add New Course
            </Link>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {courses.length === 0 ? (
          <div className="empty-state">
            <p>No courses available.</p>
            {isAdmin && (
              <Link to="/add-course" className="course-list-add-btn">
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-content">
                  <h2 className="course-card-title">{course.title}</h2>
                  <p className="course-card-description">{course.description}</p>
                  <div className="course-card-details">
                    <span className="course-card-detail">
                      Duration: {course.duration} hours
                    </span>
                    <span className="course-card-detail">
                      Price: ${course.price}
                    </span>
                  </div>
                </div>
                {isAdmin ? (
                  <div className="course-card-actions">
                    <Link
                      to={`/edit-course/${course.id}`}
                      className="course-card-btn course-card-btn-primary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="course-card-btn course-card-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="course-card-actions">
                    <Link
                      to={`/course-details/${course.id}`}
                      className="course-card-btn course-card-btn-primary"
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


