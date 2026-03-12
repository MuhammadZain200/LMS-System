import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className="landing-navbar">
        <div className="landing-navbar-container">
          <button
            className="landing-logo"
            onClick={() => scrollToSection("hero")}
          >
            <span className="landing-logo-icon" />
            <div className="landing-logo-text">
              <span className="landing-logo-title">Learning</span>
              <span className="landing-logo-subtitle">Management Systems</span>
            </div>
          </button>

          <div className="landing-navbar-right">
            <nav className="landing-navbar-links">
              <button onClick={() => scrollToSection("features")}>
                Features
              </button>
              <button onClick={() => scrollToSection("how-it-works")}>
                How It Works
              </button>
              <button onClick={() => scrollToSection("stats")}>Stats</button>
              <button onClick={() => scrollToSection("testimonials")}>
                Testimonials
              </button>
            </nav>
            <div className="landing-auth-buttons">
              <button
                className="landing-btn ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="landing-btn primary"
                onClick={() => navigate("/login")}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section id="hero" className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-text reveal-on-scroll">
              <p className="landing-kicker">Modern LMS for growing teams</p>
              <h1 className="landing-hero-title">
                Empower every learner with a{" "}
                <span>beautiful, structured LMS platform.</span>
              </h1>
              <p className="landing-hero-subtitle">
                Centralize courses, track student progress, manage assignments,
                and deliver delightful learning experiences — all in one
                place that matches your institutional brand.
              </p>
              <div className="landing-hero-actions">
                <button
                  className="landing-btn primary lg"
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </button>
                <Link to="/login" className="landing-btn outline lg">
                  Login
                </Link>
              </div>
              <div className="landing-hero-meta">
                <span className="dot" />
                <p>Secure, role-based access for admins, instructors & students.</p>
              </div>
            </div>

            <div className="landing-hero-visual reveal-on-scroll">
              <div className="hero-illustration">
                <div className="hero-illustration-bg" />
                <div className="hero-illustration-panel courses">
                  <div className="hero-panel-header">
                    <span className="hero-badge">Courses</span>
                    <span className="hero-status-dot" />
                  </div>
                  <ul className="hero-panel-list">
                    <li>
                      <span className="pill pill-yellow" />
                      <div>
                        <p>Full Stack Development</p>
                        <span>24 modules • 180 learners</span>
                      </div>
                    </li>
                    <li>
                      <span className="pill pill-amber" />
                      <div>
                        <p>Data Science Foundations</p>
                        <span>18 modules • 96 learners</span>
                      </div>
                    </li>
                    <li>
                      <span className="pill pill-warm" />
                      <div>
                        <p>UI/UX for Beginners</p>
                        <span>12 modules • 64 learners</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="hero-illustration-panel progress">
                  <p className="hero-progress-title">Overall Completion</p>
                  <div className="hero-progress-bar">
                    <div className="hero-progress-fill" />
                  </div>
                  <div className="hero-progress-footer">
                    <span>Active Students</span>
                    <strong>95% on track</strong>
                  </div>
                </div>

                <div className="hero-illustration-badge">
                  <span className="hero-badge-icon">✓</span>
                  <div>
                    <p>Compliance-ready learning</p>
                    <span>Audit-friendly reports in seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="landing-section landing-section-alt">
          <div className="landing-container">
            <header className="section-header reveal-on-scroll">
              <p className="section-kicker">Platform capabilities</p>
              <h2>Everything you need to run learning at scale.</h2>
              <p className="section-subtitle">
                From course creation to completion certificates, the LMS keeps
                every stakeholder aligned and informed.
              </p>
            </header>

            <div className="features-grid">
              {[
                {
                  title: "Course Management",
                  desc: "Create, organize, and publish structured courses with rich content and media.",
                },
                {
                  title: "Student Progress Tracking",
                  desc: "Monitor learner journeys with visual progress indicators and milestones.",
                },
                {
                  title: "Assignments & Quizzes",
                  desc: "Assess understanding with flexible assignments, timed quizzes, and grading tools.",
                },
                {
                  title: "Certificates",
                  desc: "Automatically issue branded certificates when learners complete courses.",
                },
                {
                  title: "Live Classes",
                  desc: "Host synchronous sessions and blend them into existing course flows.",
                },
                {
                  title: "Analytics Dashboard",
                  desc: "View key insights across courses, cohorts, and instructors in real-time.",
                },
              ].map((feature) => (
                <article
                  key={feature.title}
                  className="feature-card reveal-on-scroll"
                >
                  <div className="feature-icon">
                    <span className="feature-icon-dot" />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="landing-section">
          <div className="landing-container">
            <header className="section-header reveal-on-scroll">
              <p className="section-kicker">How it works</p>
              <h2>Launch learning in three simple steps.</h2>
            </header>

            <div className="how-grid">
              {[
                {
                  step: "01",
                  title: "Register",
                  desc: "Create your account and set your role as an administrator, instructor, or student.",
                },
                {
                  step: "02",
                  title: "Enroll in Courses",
                  desc: "Browse curated courses, enroll learners, and map out personalized learning paths.",
                },
                {
                  step: "03",
                  title: "Learn & Track Progress",
                  desc: "Complete modules, attempt quizzes, attend live classes, and track performance.",
                },
              ].map((item) => (
                <article key={item.step} className="how-card reveal-on-scroll">
                  <div className="how-step">
                    <span>{item.step}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="landing-section landing-section-alt">
          <div className="landing-container">
            <div className="stats-wrapper reveal-on-scroll">
              <header className="section-header compact">
                <p className="section-kicker">By the numbers</p>
                <h2>Designed to scale with your learners.</h2>
              </header>
              <div className="stats-grid">
                {[
                  { label: "Courses", value: "500+" },
                  { label: "Students", value: "10,000+" },
                  { label: "Instructors", value: "50+" },
                  { label: "Completion Rate", value: "95%" },
                ].map((stat) => (
                  <div key={stat.label} className="stat-card">
                    <p className="stat-value">{stat.value}</p>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="landing-section">
          <div className="landing-container">
            <header className="section-header reveal-on-scroll">
              <p className="section-kicker">Testimonials</p>
              <h2>Trusted by motivated learners everywhere.</h2>
            </header>

            <div className="testimonials-grid">
              {[
                {
                  name: "Ananya Sharma",
                  role: "Computer Science Student",
                  text: "The LMS keeps all my courses, assignments, and grades in one clean view. I always know what to focus on next.",
                },
                {
                  name: "Rahul Mehta",
                  role: "Full Stack Bootcamp Student",
                  text: "The progress tracking and quizzes make it easy to stay on track. I finished my program ahead of schedule.",
                },
                {
                  name: "Sara Khan",
                  role: "Business Analytics Learner",
                  text: "Live classes, recordings, and certificates are all integrated. It feels like a modern, premium learning experience.",
                },
              ].map((t) => (
                <article key={t.name} className="testimonial-card reveal-on-scroll">
                  <div className="testimonial-avatar">
                    <span>{t.name.charAt(0)}</span>
                  </div>
                  <p className="testimonial-text">“{t.text}”</p>
                  <div className="testimonial-meta">
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-logo">
              <span className="landing-logo-icon" />
              <div className="landing-logo-text">
                <span className="landing-logo-title">Learning</span>
                <span className="landing-logo-subtitle">Management Systems</span>
              </div>
            </div>
            <p className="landing-footer-copy">
              A focused LMS experience for institutions, academies, and teams.
            </p>
          </div>

          <nav className="landing-footer-nav">
            <div>
              <p className="footer-heading">Navigate</p>
              <button onClick={() => scrollToSection("features")}>
                Features
              </button>
              <button onClick={() => scrollToSection("how-it-works")}>
                How It Works
              </button>
              <button onClick={() => scrollToSection("testimonials")}>
                Testimonials
              </button>
            </div>
            <div>
              <p className="footer-heading">Account</p>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/register")}>Register</button>
            </div>
            <div>
              <p className="footer-heading">Connect</p>
              <div className="footer-social">
                <a href="#!" aria-label="Visit LMS on LinkedIn">
                  in
                </a>
                <a href="#!" aria-label="Visit LMS on Twitter">
                  X
                </a>
                <a href="#!" aria-label="Visit LMS on YouTube">
                  ▶
                </a>
              </div>
            </div>
          </nav>
        </div>
        <div className="landing-footer-bottom">
          <div className="landing-container landing-footer-bottom-inner">
            <p>© {new Date().getFullYear()} Learning Management Systems. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

