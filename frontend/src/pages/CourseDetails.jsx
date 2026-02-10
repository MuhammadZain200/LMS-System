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
  const [contentDraft, setContentDraft] = useState("");
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [classmates, setClassmates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
  });
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const role = localStorage.getItem("role");
  const isAdmin = role === "Admin";
  const isInstructor = role === "Instructor";

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (!isInstructor) {
      // Instructors manage content without needing to be enrolled
      checkEnrollment();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      // Instructors use their dedicated details endpoint, students use student-courses endpoint
      const endpoint = isInstructor
        ? `/Instructor/courses/${id}`
        : `/courses/${id}`;
      const response = await api.get(endpoint);
      const data = response.data;
      setCourse(data);

      // Initialize editable content for instructors
      if (isInstructor && data.content !== undefined) {
        setContentDraft(data.content || "");
      }

      // Classmates (students only)
      if (!isInstructor && Array.isArray(data.classmates)) {
        setClassmates(data.classmates);
      }

      // Announcements (may be present in instructor API)
      if (Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      } else {
        // Fallback: load via announcements API
        fetchAnnouncements();
      }
    } catch (err) {
      navigate("/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/Announcements/course/${id}`);
      setAnnouncements(response.data || []);
    } catch (err) {
      // Non-fatal for the page – just log
      console.error("Failed to load announcements", err);
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

  const handleSaveContent = async () => {
    if (!contentDraft.trim()) {
      setPopupMessage("Content cannot be empty.");
      setShowPopup(true);
      return;
    }

    try {
      setIsSavingContent(true);
      await api.put(`/Instructor/courses/${id}/content`, {
        content: contentDraft,
      });
      setPopupMessage("Course content updated successfully.");
      setShowPopup(true);
      setCourse((prev) => (prev ? { ...prev, content: contentDraft } : prev));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update content";
      setPopupMessage(msg);
      setShowPopup(true);
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      setPopupMessage("Title and message are required for an announcement.");
      setShowPopup(true);
      return;
    }

    try {
      setIsSavingAnnouncement(true);
      const response = await api.post("/Announcements", {
        courseId: Number(id),
        title: newAnnouncement.title.trim(),
        message: newAnnouncement.message.trim(),
      });

      // Prepend new announcement to the list
      setAnnouncements((prev) => [
        {
          id: response.data.id,
          title: response.data.title,
          message: response.data.message,
          createdAt: response.data.createdAt,
        },
        ...prev,
      ]);

      setNewAnnouncement({ title: "", message: "" });
      setPopupMessage("Announcement posted successfully.");
      setShowPopup(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create announcement";
      setPopupMessage(msg);
      setShowPopup(true);
    } finally {
      setIsSavingAnnouncement(false);
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
      setPopupMessage("Already enrolled in this course");
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
            {!isAdmin && !isInstructor && (
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

            {/* Course content section */}
            <div style={{ marginTop: 32 }}>
              <h2 className="course-details-title" style={{ fontSize: "1.4rem" }}>
                Course Content
              </h2>
              {isInstructor ? (
                <>
                  <textarea
                    className="course-details-content-textarea"
                    rows={8}
                    value={contentDraft}
                    onChange={(e) => setContentDraft(e.target.value)}
                    placeholder="Add detailed course content, syllabus, or lesson notes here..."
                  />
                  <button
                    className="course-details-btn course-details-btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={handleSaveContent}
                    disabled={isSavingContent}
                  >
                    {isSavingContent ? "Saving..." : "Save Content"}
                  </button>
                </>
              ) : course.content ? (
                <p className="course-details-content">
                  {course.content}
                </p>
              ) : (
                <p className="course-details-content course-details-content-empty">
                  Course content will appear here once available.
                </p>
              )}
            </div>

            {/* Classmates section – students only */}
            {!isInstructor && classmates && classmates.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h2
                  className="course-details-title"
                  style={{ fontSize: "1.4rem" }}
                >
                  Other Students Enrolled
                </h2>
                <ul className="course-details-classmates-list">
                  {classmates.map((s) => (
                    <li key={s.id}>
                      {s.name} ({s.email})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Announcements section */}
            <div style={{ marginTop: 32 }}>
              <h2
                className="course-details-title"
                style={{ fontSize: "1.4rem" }}
              >
                Announcements
              </h2>

              {announcements.length === 0 ? (
                <p className="course-details-content course-details-content-empty">
                  No announcements yet.
                </p>
              ) : (
                <ul className="course-details-announcements-list">
                  {announcements.map((a) => (
                    <li key={a.id} className="course-details-announcement-item">
                      <h3>{a.title}</h3>
                      <p>{a.message}</p>
                      {a.createdAt && (
                        <small>
                          {new Date(a.createdAt).toLocaleString()}
                        </small>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isInstructor && (
                <form
                  onSubmit={handleCreateAnnouncement}
                  className="course-details-announcement-form"
                >
                  <input
                    type="text"
                    placeholder="Announcement title"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="course-details-announcement-input"
                  />
                  <textarea
                    placeholder="Write an announcement for your students..."
                    value={newAnnouncement.message}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={4}
                    className="course-details-announcement-textarea"
                  />
                  <button
                    type="submit"
                    className="course-details-btn course-details-btn-primary"
                    disabled={isSavingAnnouncement}
                  >
                    {isSavingAnnouncement ? "Posting..." : "Post Announcement"}
                  </button>
                </form>
              )}
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
