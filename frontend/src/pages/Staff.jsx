import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useRequireRole } from "../utils/useRequireRole";
import { getComplaints, updateComplaint } from "../utils/api";

const STATUS_OPTIONS = ["Assigned", "In Progress", "Work Completed"];

export default function Staff() {
  const user = useRequireRole("staff");

  const [complaints, setComplaints] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (user) {
      refreshComplaints();
    }
  }, [user]);

  async function refreshComplaints() {
    setLoading(true);
    const assigned = await getComplaints({ assignedStaff: user.name });
    setComplaints(assigned);

    const newDrafts = {};
    assigned.forEach((c) => {
      newDrafts[c.id] = { status: c.status, remark: c.remark || "" };
    });
    setDrafts(newDrafts);
    setLoading(false);
  }

  function handleDraftChange(id, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  // Auto-saves status immediately when dropdown changes
  async function updateStatusOnly(id, newStatus) {
    handleDraftChange(id, "status", newStatus);

    const response = await updateComplaint({ id, status: newStatus });
    if (response.success) {
      showToast(`Status for ${id} updated to "${newStatus}"`);
      refreshComplaints();
    } else {
      alert("Failed to update status on server.");
    }
  }

  // Quick 1-click button to Mark as Work Completed
  async function markWorkCompleted(id) {
    const draft = drafts[id] || {};
    const remarkText = draft.remark ? draft.remark.trim() : "Work completed by staff.";

    const response = await updateComplaint({
      id,
      status: "Work Completed",
      remark: remarkText,
    });

    if (response.success) {
      showToast(`✅ Work marked as Completed for complaint ${id}! Reflected in Admin portal.`);
      refreshComplaints();
    } else {
      alert("Failed to update status on server.");
    }
  }

  // Saves both status and remark when clicking "Save Note"
  async function saveStaffNote(id) {
    const draft = drafts[id];
    if (!draft) return;

    const response = await updateComplaint({
      id,
      status: draft.status,
      remark: draft.remark.trim(),
    });

    if (response.success) {
      showToast(`Complaint ${id} updated successfully!`);
      refreshComplaints();
    } else {
      alert("Failed to save updates to server.");
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  if (!user) return null;

  return (
    <>
      <Navbar title="Hostel Staff Dashboard" name={user.name} role="Maintenance Staff" />

      <main className="container dashboard-container">
        {toast && <div className="toast-notification">{toast}</div>}

        <section className="card">
          <div className="section-header">
            <div className="header-with-count">
              <h3>🔧 Assigned Maintenance Tasks</h3>
              <span className="count-pill">{complaints.length} Assigned</span>
            </div>
            <p className="section-desc">
              View assigned student complaints with exact room locations. When repairs are finished, click <strong>"Mark as Completed"</strong> to notify the Admin.
            </p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "85px" }}>ID</th>
                  <th>Student Info</th>
                  <th>Problem Details</th>
                  <th>Room No. / Place 📍</th>
                  <th>Category</th>
                  <th style={{ width: "135px" }}>Status</th>
                  <th style={{ minWidth: "260px" }}>Staff Remark & Action</th>
                </tr>
              </thead>
              <tbody id="staffTableBody">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">
                      {loading ? "Checking assigned tasks..." : "🎉 No complaints currently assigned to you."}
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => {
                    const draft = drafts[c.id] || {
                      status: c.status,
                      remark: c.remark || "",
                    };
                    const isCompleted = c.status === "Work Completed" || c.status === "Resolved";

                    return (
                      <tr key={c.id}>
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
                        </td>
                        <td>
                          <span className="room-pill">📍 {c.roomNo || "Not Specified"}</span>
                        </td>
                        <td>
                          <span className="category-pill">{c.category}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <StatusBadge status={c.status} />
                            <select
                              className="select-status"
                              value={draft.status}
                              onChange={(e) => updateStatusOnly(c.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td>
                          <div className="table-action-stack">
                            <input
                              type="text"
                              value={draft.remark}
                              placeholder="Add work notes (e.g. fixed wire)"
                              onChange={(e) =>
                                handleDraftChange(c.id, "remark", e.target.value)
                              }
                            />
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-small btn-secondary"
                                onClick={() => saveStaffNote(c.id)}
                                title="Save remark without changing status"
                              >
                                Save Note
                              </button>
                              {!isCompleted && (
                                <button
                                  className="btn btn-small btn-success"
                                  onClick={() => markWorkCompleted(c.id)}
                                  title="Mark work as completed and notify admin"
                                >
                                  ✅ Mark Completed
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
