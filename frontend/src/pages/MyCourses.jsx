import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/CourseList.css";

export default function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAllCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      // Backend should return enrollments for the current user based on JWT
      const response = await api.get("/enrollments");
      const enrollments = response.data || [];
      setEnrolledCourses(enrollments);
      setError("");
    } catch (err) {
      // If endpoint returns user-specific enrollments, use them directly
      // Otherwise, try to get all and filter (though backend should handle this)
      setError("Failed to load enrolled courses");
      setEnrolledCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await api.get("/courses");
      setAllCourses(response.data || []);
    } catch (err) {
      // Ignore error, just won't show enroll button
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post("/enrollments", { courseId });
      fetchEnrolledCourses();
      alert("Successfully enrolled in course!");
    } catch (err) {
      alert(err.response?.data || "Failed to enroll in course");
    }
  };

  const getEnrolledCourseIds = () => {
    return enrolledCourses.map(
      (enrollment) => enrollment.courseId || enrollment.course?.id
    );
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-state">Loading your courses...</div>
        </div>
      </div>
    );
  }

  // Get enrolled course IDs
  const enrolledCourseIds = getEnrolledCourseIds();
  
  // If enrollments include full course data, use that; otherwise match with allCourses
  const enrolledCoursesData = enrolledCourses.length > 0 && enrolledCourses[0]?.course
    ? enrolledCourses.map(e => e.course).filter(Boolean)
    : allCourses.filter((course) => enrolledCourseIds.includes(course.id));

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="course-list-header">
          <h1 className="dashboard-title">My Courses</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {enrolledCoursesData.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <button
              onClick={() => navigate("/courses")}
              className="course-list-add-btn"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="course-grid">
            {enrolledCoursesData.map((course) => (
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
                <div className="course-card-actions">
                  <button className="course-card-btn course-card-btn-primary" disabled>
                    Enrolled
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

