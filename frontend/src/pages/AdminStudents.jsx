import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/AdminStudents.css";

/**
 * Admin-only page: manage student accounts
 * - List all students
 * - Activate / deactivate students
 * - View a student's enrollments
 *
 * IMPORTANT:
 * - Token is read from localStorage via the shared axios interceptor in `services/api.js`
 * - This page assumes backend endpoints:
 *   GET    /api/admin/students
 *   PUT    /api/admin/students/{id}/status?isActive={true|false}
 *   GET    /api/admin/students/{id}/enrollments
 */
export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState("");

  const hasStudents = useMemo(() => Array.isArray(students) && students.length > 0, [students]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await api.get("/admin/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError(err.response?.data?.message || err.response?.data || "Failed to load students.");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudentStatus = async (studentId, isActive) => {
    try {
      // Backend: PUT /api/Course/students/{id}/status?isActive=true|false (CourseController)
      await api.put(`/Course/students/${studentId}/status?isActive=${isActive}`, {});

      // Update UI state without reloading the page
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, isActive } : s))
      );

      // If the selected student is the one updated, keep selection in sync
      setSelectedStudent((prev) =>
        prev && prev.id === studentId ? { ...prev, isActive } : prev
      );
    } catch (err) {
      console.error("Failed to update student status:", err);
      alert(err.response?.data?.message || err.response?.data || "Failed to update status.");
    }
  };

  const handleViewEnrollments = async (student) => {
    setSelectedStudent(student);
    setEnrollments([]);
    setEnrollmentsError("");

    try {
      setIsLoadingEnrollments(true);
      // Backend: GET /api/Course/students/{id}/enrollments (CourseController)
      const res = await api.get(`/Course/students/${student.id}/enrollments`);
      setEnrollments(res.data || []);
    } catch (err) {
      console.error("Failed to load student enrollments:", err);
      setEnrollmentsError(
        err.response?.data?.message || err.response?.data || "Failed to load enrollments."
      );
      setEnrollments([]);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="admin-students-header">
          <h1 className="dashboard-title">Student Management</h1>
          <p className="dashboard-subtitle">
            View students, activate/deactivate accounts, and inspect enrollments.
          </p>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading students...</div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}

            {!hasStudents ? (
              <div className="empty-state">
                <p>No students found.</p>
              </div>
            ) : (
              <div className="admin-students-table-wrapper">
                <table className="admin-students-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>
                          <span
                            className={
                              s.isActive
                                ? "admin-students-status admin-students-status-active"
                                : "admin-students-status admin-students-status-inactive"
                            }
                          >
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="admin-students-actions">
                            {s.isActive ? (
                              <button
                                className="admin-students-btn admin-students-btn-danger"
                                onClick={() => updateStudentStatus(s.id, false)}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                className="admin-students-btn admin-students-btn-primary"
                                onClick={() => updateStudentStatus(s.id, true)}
                              >
                                Activate
                              </button>
                            )}

                            <button
                              className="admin-students-btn admin-students-btn-secondary"
                              onClick={() => handleViewEnrollments(s)}
                            >
                              View Enrollments
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Conditional section below the table (simple + minimal UI change) */}
            {selectedStudent && (
              <div className="admin-students-enrollments">
                <div className="admin-students-enrollments-header">
                  <h2>
                    Enrollments: <span>{selectedStudent.name}</span>
                  </h2>
                  <button
                    className="admin-students-btn admin-students-btn-link"
                    onClick={() => {
                      setSelectedStudent(null);
                      setEnrollments([]);
                      setEnrollmentsError("");
                    }}
                  >
                    Close
                  </button>
                </div>

                {isLoadingEnrollments ? (
                  <div className="loading-state">Loading enrollments...</div>
                ) : (
                  <>
                    {enrollmentsError && (
                      <div className="error-message">{enrollmentsError}</div>
                    )}

                    {enrollments.length === 0 ? (
                      <div className="empty-state">
                        <p>No enrollments found for this student.</p>
                      </div>
                    ) : (
                      <div className="admin-students-enrollments-list">
                        {enrollments.map((e, idx) => (
                          <div key={e.courseId || idx} className="admin-students-enrollment-item">
                            <div className="admin-students-enrollment-title">
                              {e.courseTitle || e.title || "Untitled Course"}
                            </div>
                            <div className="admin-students-enrollment-date">
                              {e.enrollDate || e.enrolledAt
                                ? new Date(e.enrollDate || e.enrolledAt).toLocaleString()
                                : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


