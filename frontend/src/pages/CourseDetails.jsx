import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { getToken, getUserIdFromToken } from "../utils/auth";
import "../styles/CourseDetails.css";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
    checkEnrollment();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
    } catch (err) {
      alert(err.response?.data || "Failed to load course");
      navigate("/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      
      if (!userId) {
        return; // Can't check enrollment without userId
      }

      // Backend endpoint: GET /api/enrollments/{userId}
      const response = await api.get(`/enrollments/${userId}`);
      const enrollments = response.data || [];
      const enrolled = enrollments.some(
        (e) => e.courseId === parseInt(id) || e.course?.id === parseInt(id)
      );
      setIsEnrolled(enrolled);
    } catch (err) {
      // Ignore error - enrollment check is not critical
      console.error("Error checking enrollment:", err);
    }
  };

  const handleEnroll = async () => {
    if (isEnrolled) return;

    try {
      setIsEnrolling(true);
      await api.post("/enrollments", { courseId: parseInt(id) });
      setIsEnrolled(true);
      alert("Successfully enrolled in course!");
    } catch (err) {
      alert(err.response?.data || "Failed to enroll in course");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-state">Loading course details...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <button
          onClick={() => navigate("/courses")}
          className="course-details-back-btn"
        >
          ← Back to Courses
        </button>

        <div className="course-details-card">
          <h1 className="course-details-title">{course.title}</h1>
          <p className="course-details-description">{course.description}</p>

          <div className="course-details-info">
            <div className="course-details-info-item">
              <span className="course-details-info-label">Duration:</span>
              <span className="course-details-info-value">
                {course.duration} hours
              </span>
            </div>
            <div className="course-details-info-item">
              <span className="course-details-info-label">Price:</span>
              <span className="course-details-info-value">${course.price}</span>
            </div>
          </div>

          <div className="course-details-actions">
            {isEnrolled ? (
              <button className="course-details-btn course-details-btn-disabled" disabled>
                Already Enrolled
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="course-details-btn course-details-btn-primary"
                disabled={isEnrolling}
              >
                {isEnrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            )}
            <button
              onClick={() => navigate("/my-courses")}
              className="course-details-btn course-details-btn-secondary"
            >
              View My Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


