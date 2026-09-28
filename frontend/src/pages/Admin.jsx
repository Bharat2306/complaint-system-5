import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useRequireRole } from "../utils/useRequireRole";
import { getComplaints, getStaffList, updateComplaint, addStaff, removeStaff } from "../utils/api";

const ALL_STATUSES = ["Pending", "Assigned", "In Progress", "Work Completed", "Resolved"];

export default function Admin() {
  const user = useRequireRole("admin");

  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Staff management form state
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffAlert, setStaffAlert] = useState({ text: "", type: "" });

  useEffect(() => {
    refreshStaff();
  }, []);

  async function refreshStaff() {
    const list = await getStaffList();
    setStaffList(list);
  }

  useEffect(() => {
    if (user) {
      refreshComplaints();
    }
  }, [user]);

  async function refreshComplaints() {
    setLoading(true);
    const all = await getComplaints();
    setComplaints(all);

    const initialSelection = {};
    all.forEach((c) => {
      initialSelection[c.id] = c.assignedStaff || "";
    });
    setSelectedStaff(initialSelection);
    setLoading(false);
  }

  // Handle adding a new staff member
  async function handleAddStaff(e) {
    e.preventDefault();
    setStaffAlert({ text: "", type: "" });

    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
      setStaffAlert({ text: "Please enter staff name, email, and password.", type: "error" });
      return;
    }

    setStaffLoading(true);
    const response = await addStaff({
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      password: newStaffPassword.trim(),
    });
    setStaffLoading(false);

    if (response.success) {
      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPassword("");
      setStaffAlert({ text: response.message || "Staff member added successfully!", type: "success" });
      showToast(`👤 Added ${newStaffName.trim()} to staff team!`);
      refreshStaff();
    } else {
      setStaffAlert({ text: response.message || "Failed to add staff member.", type: "error" });
    }
  }

  // Handle removing a staff member
  async function handleRemoveStaff(staffName) {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove staff member "${staffName}"?\nThis will also revoke their login access.`
    );
    if (!confirmDelete) return;

    const response = await removeStaff({ name: staffName });
    if (response.success) {
      showToast(`🗑️ Removed staff member ${staffName}.`);
      setStaffAlert({ text: response.message || `Removed ${staffName}`, type: "success" });
      refreshStaff();
      refreshComplaints();
    } else {
      alert(response.message || "Failed to remove staff member.");
    }
  }

  // Assign staff to complaint
  async function assignStaff(id) {
    const chosenStaff = selectedStaff[id];

    if (!chosenStaff) {
      alert("Please select a staff member first from the dropdown.");
      return;
    }

    const response = await updateComplaint({
      id,
      assignedStaff: chosenStaff,
    });

    if (response.success) {
      showToast(`Complaint ${id} assigned to ${chosenStaff}!`);
      refreshComplaints();
    } else {
      alert("Failed to assign staff on server.");
    }
  }

  // Admin directly marks complaint as Resolved
  async function markResolved(id) {
    const response = await updateComplaint({
      id,
      status: "Resolved",
    });

    if (response.success) {
      showToast(`✅ Complaint ${id} verified and marked as Resolved!`);
      refreshComplaints();
    } else {
      alert("Failed to update status.");
    }
  }

  // Admin changes status from dropdown
  async function handleStatusChange(id, newStatus) {
    const response = await updateComplaint({
      id,
      status: newStatus,
    });

    if (response.success) {
      showToast(`Complaint ${id} status changed to "${newStatus}"`);
      refreshComplaints();
    } else {
      alert("Failed to update status.");
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  if (!user) return null;

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const assigned = complaints.filter((c) => c.status === "Assigned").length;
  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const completed = complaints.filter((c) => c.status === "Work Completed").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <>
      <Navbar title="Admin Dashboard" name={user.name} role="Hostel Administrator" />

      <main className="container dashboard-container">
        {toast && <div className="toast-notification">{toast}</div>}

        {/* Summary Statistics Cards */}
        <section className="summary-row">
          <div className="summary-card stat-total">
            <span className="stat-icon">📊</span>
            <h1>{total}</h1>
            <p>Total</p>
          </div>
          <div className="summary-card stat-pending">
            <span className="stat-icon">⏳</span>
            <h1>{pending}</h1>
            <p>Pending</p>
          </div>
          <div className="summary-card stat-assigned">
            <span className="stat-icon">👤</span>
            <h1>{assigned}</h1>
            <p>Assigned</p>
          </div>
          <div className="summary-card stat-inprogress">
            <span className="stat-icon">⚡</span>
            <h1>{inProgress}</h1>
            <p>In Progress</p>
          </div>
          <div className="summary-card stat-completed">
            <span className="stat-icon">🛠️</span>
            <h1>{completed}</h1>
            <p>Work Done</p>
          </div>
          <div className="summary-card stat-resolved">
            <span className="stat-icon">✅</span>
            <h1>{resolved}</h1>
            <p>Resolved</p>
          </div>
        </section>

        {/* All Complaints Management Table */}
        <section className="card">
          <div className="section-header">
            <div className="header-with-count">
              <h3>📋 Hostel Grievances & Task Tracking</h3>
              <span className="count-pill">{complaints.length} Records</span>
            </div>
            <p className="section-desc">
              Assign staff to new complaints, monitor repair remarks, and verify completed maintenance work
            </p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Student</th>
                  <th>Grievance & Description</th>
                  <th>Room / Place 📍</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Staff Remark</th>
                  <th>Assign Staff</th>
                  <th style={{ minWidth: "140px" }}>Admin Action</th>
                </tr>
              </thead>
              <tbody id="adminTableBody">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="no-data">
                      {loading ? "Loading complaints database..." : "No complaints recorded yet."}
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => {
                    const isWorkDone = c.status === "Work Completed";

                    return (
                      <tr key={c.id} className={isWorkDone ? "row-highlight-completed" : ""}>
                        <td>
                          <span className="complaint-id-tag">{c.id}</span>
                        </td>
                        <td>
                          <strong>{c.studentName}</strong>
                          <br />
                          <small className="text-muted">{c.studentEmail}</small>
                        </td>
                        <td>
                          <strong>{c.title}</strong>
                          <p className="table-desc">{c.description}</p>
                          <small className="text-muted">Date: {c.date}</small>
                        </td>
                        <td>
                          <span className="room-pill">📍 {c.roomNo || "Not Specified"}</span>
                        </td>
                        <td>
                          <span className="category-pill">{c.category}</span>
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                          <select
                            className="select-status-mini"
                            value={c.status}
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            title="Update status"
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {c.remark ? (
                            <div className="staff-remark-badge">
                              <strong>{c.assignedStaff || "Staff"}:</strong> {c.remark}
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>No remark yet</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <select
                              className="select-staff"
                              value={selectedStaff[c.id] || ""}
                              onChange={(e) =>
                                setSelectedStaff((prev) => ({
                                  ...prev,
                                  [c.id]: e.target.value,
                                }))
                              }
                            >
                              <option value="">-- Select Staff --</option>
                              {staffList.map((staff) => (
                                <option key={staff} value={staff}>
                                  {staff}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() => assignStaff(c.id)}
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                        <td>
                          {isWorkDone ? (
                            <button
                              className="btn btn-small btn-success"
                              onClick={() => markResolved(c.id)}
                              title="Staff has finished work! Click to verify and mark resolved."
                            >
                              ✅ Verify & Resolve
                            </button>
                          ) : c.status === "Resolved" ? (
                            <span className="text-success" style={{ fontSize: "12px", fontWeight: "600" }}>
                              ✔ Resolved
                            </span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>
                              {c.status === "Pending" ? "Awaiting Staff" : "Under Repair"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Hostel Staff Management Section (Admin Only) */}
        <section className="card staff-admin-card" style={{ marginTop: "24px" }}>
          <div className="section-header">
            <div className="header-with-count">
              <h3>👥 Hostel Staff Team Management</h3>
              <span className="count-pill">{staffList.length} Active Staff</span>
            </div>
            <p className="section-desc">
              Only hostel administrators have permission to register new maintenance workers or remove existing staff.
            </p>
          </div>

          {staffAlert.text && (
            <div
              className={staffAlert.type === "success" ? "success-banner" : "error-banner"}
              style={{ marginBottom: "16px" }}
            >
              {staffAlert.text}
            </div>
          )}

          <div className="staff-admin-grid">
            {/* Form to Add Staff */}
            <div className="staff-add-form-container">
              <h4 style={{ marginBottom: "12px", fontSize: "15px", color: "#1e293b" }}>
                ➕ Register New Staff Member
              </h4>
              <form onSubmit={handleAddStaff} className="form-stack">
                <div className="form-group">
                  <label htmlFor="adminStaffName">Full Name</label>
                  <input
                    type="text"
                    id="adminStaffName"
                    placeholder="e.g. Mohan Lal"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adminStaffEmail">Staff Email ID</label>
                  <input
                    type="email"
                    id="adminStaffEmail"
                    placeholder="e.g. mohan@staff.com"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adminStaffPassword">Initial Login Password</label>
                  <input
                    type="password"
                    id="adminStaffPassword"
                    placeholder="Default password (e.g. 1234)"
                    required
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={staffLoading}>
                  {staffLoading ? "Registering Staff..." : "+ Register New Staff"}
                </button>
              </form>
            </div>

            {/* Current Staff Roster */}
            <div className="staff-roster-container">
              <h4 style={{ marginBottom: "12px", fontSize: "15px", color: "#1e293b" }}>
                🛠️ Active Maintenance Team
              </h4>
              {staffList.length === 0 ? (
                <p className="text-muted" style={{ padding: "16px 0" }}>No staff members registered.</p>
              ) : (
                <div className="staff-roster-list">
                  {staffList.map((staffName) => (
                    <div className="staff-roster-item" key={staffName}>
                      <div className="staff-info-block">
                        <span className="staff-avatar-icon">🛠️</span>
                        <div>
                          <strong>{staffName}</strong>
                          <span className="staff-role-badge">Maintenance Staff</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleRemoveStaff(staffName)}
                        title={`Remove ${staffName} from staff team`}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

