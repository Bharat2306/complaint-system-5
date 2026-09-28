import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../utils/api";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await signupUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      if (!response.success) {
        setError(response.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError("Server communication error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <header className="navbar">
        <div className="nav-brand">
          <h2>🏠 Smart Hostel Complaint Management System</h2>
        </div>
      </header>

      <div className="center-box">
        <div className="card auth-card">
          <div className="auth-header">
            <h3>Student Registration</h3>
            <p className="auth-subtitle">Create a student account to file hostel grievances</p>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label htmlFor="signupName">Full Name</label>
              <input
                type="text"
                id="signupName"
                placeholder="Enter your full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signupEmail">College Email Address</label>
              <input
                type="email"
                id="signupEmail"
                placeholder="student@college.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <input
                type="password"
                id="signupPassword"
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signupConfirmPassword">Confirm Password</label>
              <input
                type="password"
                id="signupConfirmPassword"
                placeholder="Re-enter password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>

          <div className="auth-footer">
            <Link className="link-text" to="/">
              Already have an account? <strong>Login here</strong>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
