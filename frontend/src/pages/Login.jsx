import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, setCurrentUser } from "../utils/api";
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await loginUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: role,
      });

      if (!response.success) {
        setError(response.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // Save user to browser session
      setCurrentUser(response.user);

      // Redirect based on role
      if (response.user.role === "student") {
        navigate("/student");
      } else if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "staff") {
        navigate("/staff");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
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
            <h3>Portal Login</h3>
            <p className="auth-subtitle">Login with your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label htmlFor="loginRole">Select Your Role</label>
              <select
                id="loginRole"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setError("");
                }}
              >
                <option value="student">Student</option>
                <option value="staff">Hostel Staff</option>
                <option value="admin">Hostel Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="loginEmail">Email Address / Staff ID</label>
              <input
                type="email"
                id="loginEmail"
                placeholder={role === "staff" ? "e.g. suresh@staff.com" : role === "admin" ? "e.g. admin@hostel.com" : "e.g. demo@student.com"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Verifying..." : `Login as ${role === "staff" ? "Staff" : role === "admin" ? "Admin" : "Student"}`}
            </button>
          </form>

          <div className="auth-footer">
            {role === "student" && (
              <Link className="link-text" to="/signup">
                New student? <strong>Register here</strong>
              </Link>
            )}

            <div className="demo-credentials">
              <span className="demo-title">💡 Demo Accounts:</span>
              <p>
                <strong>👨‍🎓 Student:</strong> <code>demo@student.com</code> / pass: <code>1234</code>
              </p>
              <p>
                <strong>🛠️ Staff (Suresh):</strong> <code>suresh@staff.com</code> / pass: <code>1234</code>
              </p>
              <p>
                <strong>🛠️ Staff (Ramesh):</strong> <code>ramesh@staff.com</code> / pass: <code>1234</code>
              </p>
              <p>
                <strong>👑 Admin:</strong> <code>admin@hostel.com</code> / pass: <code>1234</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
