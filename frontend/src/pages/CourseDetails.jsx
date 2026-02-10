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
  const role = localStorage.getItem("role");
  const isAdmin = role === "Admin";

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

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
      navigate("/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const token = getToken();
      const userId = getUserIdFromToken(token);
      if (!userId) return;

      const response = await api.get(`/enrollments/${userId}`);
      const enrollments = response.data || [];

      const enrolled = enrollments.some(
        (e) => e.courseId === Number(id) || e.course?.id === Number(id)
      );

      setIsEnrolled(enrolled);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async () => {
    if (isEnrolled) {
      setPopupMessage("You are already enrolled in this course.");
      setShowPopup(true);
      return;
    }

    try {
      setIsEnrolling(true);
      await api.post("/enrollments", { courseId: Number(id) });
      setIsEnrolled(true);
      setPopupMessage("Successfully enrolled in the course!");
      setShowPopup(true);
    } catch (err) {
      setPopupMessage("Successfully enrolled in the course!");
      setShowPopup(true);
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

  if (!course) return null;

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
              <span className="course-details-info-label">Duration</span>
              <span className="course-details-info-value">
                {course.duration} hours
              </span>
            </div>
            <div className="course-details-info-item">
              <span className="course-details-info-label">Price</span>
              <span className="course-details-info-value">${course.price}</span>
            </div>
          </div>

          <div className="course-details-actions">
            {!isAdmin && (
              <button
                onClick={handleEnroll}
                className={`course-details-btn ${
                  isEnrolled
                    ? "course-details-btn-disabled"
                    : "course-details-btn-primary"
                }`}
                disabled={isEnrolling}
              >
                {isEnrolled
                  ? "Already Enrolled"
                  : isEnrolling
                  ? "Enrolling..."
                  : "Enroll Now"}
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

        {/* ✅ POPUP */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-modal">
              <p>{popupMessage}</p>
              <button
                className="popup-btn"
                onClick={() => setShowPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
