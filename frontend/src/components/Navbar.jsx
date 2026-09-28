import { useNavigate } from "react-router-dom";
import { clearCurrentUser } from "../utils/api";

/* Top navigation bar used on Student / Staff / Admin dashboards */
export default function Navbar({ title, name, role }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearCurrentUser();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="nav-brand">
        <h2>🏠 {title}</h2>
      </div>
      <div className="nav-right">
        <div className="user-pill">
          <span className="user-name">{name}</span>
          {role && <span className="user-role-tag">{role}</span>}
        </div>
        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
