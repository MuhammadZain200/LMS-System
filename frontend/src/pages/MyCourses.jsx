import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { getToken, getUserIdFromToken, decodeToken } from "../utils/auth";
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
      const token = getToken();
      const userId = getUserIdFromToken(token);
      
      // Debug logging
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Extracted userId:", userId);
      
      if (!userId) {
        // Try to decode and show what's in the token
        const decoded = decodeToken(token);
        console.log("Decoded token:", decoded);
        setError("Unable to get user ID from token. Please login again.");
        setEnrolledCourses([]);
        return;
      }

      // Backend endpoint: GET /api/enrollments/{userId}
      const response = await api.get(`/enrollments/${userId}`);
      console.log("Enrollments response:", response.data);
      
      const enrollments = Array.isArray(response.data) ? response.data : [];
      console.log("Processed enrollments:", enrollments);
      
      setEnrolledCourses(enrollments);
      setError("");
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      console.error("Error response:", err.response);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to load enrolled courses";
      setError(errorMsg);
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
    const ids = enrolledCourses.map((enrollment) => {
      // Try multiple possible structures
      return enrollment.courseId || 
             enrollment.course?.id || 
             enrollment.courseId || 
             enrollment.id ||
             null;
    }).filter(id => id !== null);
    
    console.log("Enrolled course IDs:", ids);
    return ids;
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
  console.log("All courses:", allCourses);
  console.log("Enrolled course IDs to match:", enrolledCourseIds);
  
  // If enrollments include full course data, use that; otherwise match with allCourses
  let enrolledCoursesData = [];
  
  if (enrolledCourses.length > 0) {
    // Check if enrollments have nested course objects
    if (enrolledCourses[0]?.course) {
      enrolledCoursesData = enrolledCourses.map(e => e.course).filter(Boolean);
    } else if (enrolledCourses[0]?.courseId !== undefined) {
      // Match by courseId
      enrolledCoursesData = allCourses.filter((course) => 
        enrolledCourseIds.some(id => 
          id === course.id || 
          String(id) === String(course.id)
        )
      );
    } else {
      // Enrollment might be the course itself
      enrolledCoursesData = enrolledCourses.filter(e => e.title || e.name);
    }
  }
  
  console.log("Final enrolled courses data:", enrolledCoursesData);

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

