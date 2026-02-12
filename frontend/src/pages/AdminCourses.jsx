import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/AdminCourses.css";
import ViewStudents from "../components/ViewStudents";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingCourseStudents, setLoadingCourseStudents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);  // controls modal
  const [selectedCourseStudents, setSelectedCourseStudents] = useState([]); // students for selected course

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("/Course");
      setCourses(response.data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load courses");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/Course/${courseId}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data || "Failed to delete course");
    }
  };

  const handleViewStudents = async (courseId) => {
    try {
      setLoadingCourseStudents((prev) => ({ ...prev, [courseId]: true }));
      const res = await api.get(`/Course/courses/${courseId}/students`);
      setSelectedCourseStudents(res.data || []); // store students
      setIsModalOpen(true);                       // open modal
    } catch (err) {
      alert(err.response?.data?.message ||  "Failed to load students");
    } finally {
      setLoadingCourseStudents((prev) => ({ ...prev, [courseId]: false }));
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
        <div className="admin-courses-header">
          <h1 className="dashboard-title">Course Management</h1>
          <Link to="/add-course" className="admin-courses-add-btn">Add New Course</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {courses.length === 0 ? (
          <div className="empty-state">
            <p>No courses available.</p>
            <Link to="/add-course" className="admin-courses-add-btn">Create Your First Course</Link>
          </div>
        ) : (
          <div className="admin-courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="admin-course-card">
                <div className="admin-course-card-content">
                  <h2 className="admin-course-card-title">{course.title}</h2>
                  <p className="admin-course-card-description">{course.description}</p>
                  <div className="admin-course-card-details">
                    <span>Duration: {course.duration} hours</span>
                    <span>Price: ${course.price}</span>
                    <span>Instructor: {course.instructor || "Not assigned"}</span>
                  </div>
                </div>

                <div className="admin-course-card-actions">
                  <Link to={`/edit-course/${course.id}`} className="admin-course-btn admin-course-btn-primary">
                    Edit
                  </Link>

                  <button
                    onClick={() => handleViewStudents(course.id)}
                    className="admin-course-btn admin-course-btn-default"
                  >
                    View Students
                  </button>

                  <button
                    onClick={() => handleDelete(course.id)}
                    className="admin-course-btn admin-course-btn-danger"
                  >
                    Delete
                  </button>
                </div>

                {/* OLD inline students list removed */}
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing students */}
        <ViewStudents
          isOpen={isModalOpen}
          students={selectedCourseStudents}
          isClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
