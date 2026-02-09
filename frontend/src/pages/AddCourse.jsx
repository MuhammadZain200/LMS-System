import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/CourseForm.css";

export default function AddCourse() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    } else if (isNaN(formData.duration) || parseFloat(formData.duration) <= 0) {
      newErrors.duration = "Duration must be a positive number";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/courses", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: parseFloat(formData.duration),
        price: parseFloat(formData.price),
      });
      navigate("/admin-courses");
    } catch (err) {
      alert(err.response?.data || "Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="form-page-header">
          <h1 className="dashboard-title">Add New Course</h1>
          <p className="dashboard-subtitle">
            Create a new course for your learning platform.
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="course-form">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Course Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className={`form-input ${errors.title ? "form-input-error" : ""}`}
                placeholder="e.g., Introduction to React"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && (
                <span className="form-error">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className={`form-input form-textarea ${
                  errors.description ? "form-input-error" : ""
                }`}
                placeholder="Describe what students will learn..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && (
                <span className="form-error">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="duration">
                  Duration (hours)
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  className={`form-input ${
                    errors.duration ? "form-input-error" : ""
                  }`}
                  placeholder="10"
                  min="0"
                  step="0.5"
                  value={formData.duration}
                  onChange={handleChange}
                />
                {errors.duration && (
                  <span className="form-error">{errors.duration}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">
                  Price ($)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  className={`form-input ${
                    errors.price ? "form-input-error" : ""
                  }`}
                  placeholder="99.99"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && (
                  <span className="form-error">{errors.price}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/admin-courses")}
                className="form-btn form-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="form-btn form-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


