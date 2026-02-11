import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { getToken, getUserIdFromToken } from "../utils/auth";
import "../styles/CourseList.css";

export default function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [courseStudents, setCourseStudents] = useState({}); // courseId -> students[]
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isInstructor = role === "Instructor";

  useEffect(() => {
    if (isInstructor) {
      fetchInstructorCourses();
    } else {
      fetchEnrolledCourses();
      fetchAllCourses();
    }
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/Instructor/my-courses");
      setInstructorCourses(response.data || []);
      setError("");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to load your courses";
      setError(errorMsg);
      setInstructorCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const userId = getUserIdFromToken(token);
      
      if (!userId) {
        setError("Unable to get user ID from token. Please login again.");
        setEnrolledCourses([]);
        return;
      }

      // Backend endpoint: GET /api/enrollments/{userId}
      const response = await api.get(`/enrollments/${userId}`);
      console.log("Enrollments response:", response.data);
      
      const enrollments = Array.isArray(response.data) ? response.data : [];
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

  const fetchCourseStudents = async (courseId) => {
    try {
      const response = await api.get(`/Instructor/courses/${courseId}/students`);
      setCourseStudents((prev) => ({
        ...prev,
        [courseId]: response.data || [],
      }));
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load students for this course"
      );
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
    return enrolledCourses
      .map((e) => e.courseId || e.course?.id || e.id)
      .filter((id) => id != null);
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

  // Instructor view: show own courses and management actions
  if (isInstructor) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="course-list-header">
            <h1 className="dashboard-title">My Teaching</h1>
            <p className="dashboard-subtitle" style={{ marginTop: 4 }}>
              Courses you teach — manage content and view enrolled students
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {instructorCourses.length === 0 ? (
            <div className="empty-state">
              <p>You are not assigned to any courses yet.</p>
            </div>
          ) : (
            <div className="course-grid">
              {instructorCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-card-content">
                    <h2 className="course-card-title">{course.title}</h2>
                    <p className="course-card-description">
                      {course.description}
                    </p>
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
                    <button
                      className="course-card-btn course-card-btn-primary"
                      onClick={() => navigate(`/course-details/${course.id}`)}
                    >
                      Manage Content
                    </button>
                    <button
                      className="course-card-btn"
                      onClick={() => fetchCourseStudents(course.id)}
                    >
                      View Students
                    </button>
                  </div>

                  {courseStudents[course.id] && (
                    <div className="instructor-enrolled-section">
                      <h3 className="instructor-enrolled-title">Enrolled Students</h3>
                      {courseStudents[course.id].length === 0 ? (
                        <p className="instructor-enrolled-empty">No students enrolled yet.</p>
                      ) : (
                        <ul className="instructor-enrolled-list">
                          {courseStudents[course.id].map((s) => (
                            <li key={s.id}>
                              <span className="instructor-enrolled-name">{s.name}</span>
                              <span className="instructor-enrolled-email">{s.email}</span>
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

  // Student view: derive enrolled courses from enrollments
  const enrolledCourseIds = getEnrolledCourseIds();

  // If enrollments include full course data, use that; otherwise match with allCourses
  let enrolledCoursesData = [];

  if (enrolledCourses.length > 0) {
    // Check if enrollments have nested course objects
    if (enrolledCourses[0]?.course) {
      enrolledCoursesData = enrolledCourses.map((e) => e.course).filter(Boolean);
    } else if (enrolledCourses[0]?.courseId !== undefined) {
      // Match by courseId
      enrolledCoursesData = allCourses.filter((course) =>
        enrolledCourseIds.some(
          (id) => id === course.id || String(id) === String(course.id)
        )
      );
    } else {
      // Enrollment might be the course itself
      enrolledCoursesData = enrolledCourses.filter((e) => e.title || e.name);
    }
  }

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
                  <Link
                    to={`/course-details/${course.id}`}
                    className="course-card-btn course-card-btn-primary"
                  >
                    View Course
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

