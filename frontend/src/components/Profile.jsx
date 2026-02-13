import React, { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "./Navbar";
import "../styles/Profile.css";

function Profile() {

    //State Variables
    const [user, setUser] = useState({
        id: "",
        name: "",
        email: "",
        profileImageUrl: "",
        role: "",
    });
    const [isLoading, setIsLoading] = useState(false); // Changed initial to false
    const [newImage, setNewImage] = useState(null);
    const [password, setPassword] = useState("");

    //Load User Data from localStorage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    //Handlers
    const handleChange = (e) => {                     // Generic function to handle any input change
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleImageChange = (e) => {                 // Function to handle profile image selection
        setNewImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();                              // Prevent form reload
        setIsLoading(true);  

        try {
            const formData = new FormData();
            formData.append("Name", user.name);        // Append Name, Email, and optional image
            formData.append("Email", user.email);
            if (newImage) formData.append("ProfileImage", newImage);

            // ✅ Use backticks for template literal
            const res = await api.put(`/profile/${user.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert(res.data.message || "Profile Updated Successfully");

            // Update localStorage with new info
            const updatedUser = { ...user };
            if (res.data.profileImageUrl) updatedUser.profileImageUrl = res.data.profileImageUrl;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

        } catch(err) {
            console.error(err);
            alert(err.response?.data || "Update failed");
        } finally {
            setIsLoading(false);
        }
    };

    // ----- JSX FORM -----
    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-ring">
                                {user.profileImageUrl ? (
                                    <img
                                        src={user.profileImageUrl}
                                        alt="Profile"
                                        className="profile-avatar-image"
                                    />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                )}
                            </div>
                            <label className="profile-avatar-upload">
                                <span className="profile-avatar-upload-icon">📷</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        <div className="profile-header-text">
                            <h1 className="profile-title">My Profile</h1>
                            <p className="profile-subtitle">
                                Manage your account information and contact details.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="profile-section">
                            <div className="profile-section-header">
                                <h2>Contact Information</h2>
                                <p>Update your basic profile details.</p>
                            </div>
                            <div className="profile-grid">
                                <div className="profile-field">
                                    <label className="profile-label">Full Name</label>
                                    <input
                                        className="profile-input"
                                        name="name"
                                        value={user.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="profile-field">
                                    <label className="profile-label">Email Address</label>
                                    <input
                                        className="profile-input"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="profile-field">
                                    <label className="profile-label">Password</label>
                                    <input
                                        className="profile-input"
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="profile-section profile-section-system">
                            <div className="profile-section-header">
                                <h2>System Identity</h2>
                                <p>These fields are managed by the system and cannot be changed.</p>
                            </div>
                            <div className="profile-grid">
                                <div className="profile-field">
                                    <label className="profile-label">Role</label>
                                    <div className="profile-pill">
                                        <span className="profile-pill-badge" />
                                        <div>
                                            <div className="profile-pill-title">
                                                {user.role || "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-field">
                                    <label className="profile-label">Student ID</label>
                                    <div className="profile-pill">
                                        <div className="profile-pill-title">
                                            {user.id ? `#STU-${user.id}` : "Not assigned"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-footer">
                            <button
                                type="button"
                                className="profile-btn profile-btn-secondary"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="profile-btn profile-btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
