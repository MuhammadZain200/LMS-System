/**
 * Admin-only: Course Management
 * - View all courses, add/edit/delete, assign instructor, view enrolled students
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/AdminCourses.css";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseStudents, setCourseStudents] = useState({});
  const [loadingCourseStudents, setLoadingCourseStudents] = useState({});

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

  const handleAssignInstructor = async (course) => {
    const email = window.prompt("Enter the instructor's email to assign to this course:", "");
    if (!email?.trim()) return;
    try {
      await api.put(`/Course/${course.id}/assign-instructor`, {
        instructorEmail: email.trim(),
      });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Failed to assign instructor");
    }
  };

  const handleViewStudents = async (courseId) => {
    if (courseStudents[courseId]) {
      setCourseStudents((prev) => {
        const copy = { ...prev };
        delete copy[courseId];
        return copy;
      });
      return;
    }
    try {
      setLoadingCourseStudents((prev) => ({ ...prev, [courseId]: true }));
      const res = await api.get(`/Course/courses/${courseId}/students`);
      setCourseStudents((prev) => ({ ...prev, [courseId]: res.data || [] }));
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Failed to load students");
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
                  <button onClick={() => handleAssignInstructor(course)} className="admin-course-btn admin-course-btn-default">
                    Assign Instructor
                  </button>
                  <button
                    onClick={() => handleViewStudents(course.id)}
                    className="admin-course-btn admin-course-btn-default"
                  >
                    {loadingCourseStudents[course.id] ? "Loading..." : courseStudents[course.id] ? "Hide Students" : "View Students"}
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="admin-course-btn admin-course-btn-danger">
                    Delete
                  </button>
                </div>

                {courseStudents[course.id] && (
                  <div className="admin-course-enrolled">
                    <h3 className="admin-course-enrolled-title">Enrolled Students</h3>
                    {courseStudents[course.id].length === 0 ? (
                      <p className="admin-course-enrolled-empty">No students enrolled yet.</p>
                    ) : (
                      <ul className="admin-course-enrolled-list">
                        {courseStudents[course.id].map((s) => (
                          <li key={s.id}>
                            <span className="admin-course-enrolled-name">{s.name}</span>
                            <span className="admin-course-enrolled-email">{s.email}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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
