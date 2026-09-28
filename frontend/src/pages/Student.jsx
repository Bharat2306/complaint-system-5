import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useRequireRole } from "../utils/useRequireRole";
import { getCategories, getComplaints, submitComplaint } from "../utils/api";

export default function Student() {
  const user = useRequireRole("student");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    getCategories().then((cats) => setCategories(cats));
  }, []);

  useEffect(() => {
    if (user) {
      loadComplaints(user.email);
    }
  }, [user]);

  async function loadComplaints(email) {
    const list = await getComplaints({ studentEmail: email });
    setMyComplaints(list);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlertMsg({ text: "", type: "" });

    if (!title.trim() || !category || !roomNo.trim() || !description.trim()) {
      setAlertMsg({ text: "Please fill in all complaint fields including Room/Place.", type: "error" });
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitComplaint({
        studentName: user.name,
        studentEmail: user.email,
        title: title.trim(),
        category: category,
        roomNo: roomNo.trim(),
        description: description.trim(),
      });

      if (response.success) {
        setTitle("");
        setCategory("");
        setRoomNo("");
        setDescription("");
        setAlertMsg({ text: "Complaint submitted successfully!", type: "success" });
        loadComplaints(user.email);
      } else {
        setAlertMsg({ text: response.message || "Failed to submit complaint.", type: "error" });
      }
    } catch (err) {
      setAlertMsg({ text: "Error connecting to server. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Navbar title="Student Dashboard" name={user.name} role="Student" />

      <main className="container dashboard-container">
        {/* Submit New Complaint Card */}
        <section className="card">
          <div className="section-header">
            <h3>📝 Register a New Hostel Complaint</h3>
            <p className="section-desc">Submit your grievance with exact room/location for quick resolution</p>
          </div>

          {alertMsg.text && (
            <div className={alertMsg.type === "success" ? "success-banner" : "error-banner"}>
              {alertMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label htmlFor="complaintTitle">Complaint Title</label>
              <input
                type="text"
                id="complaintTitle"
                placeholder="e.g. Sockets not working / Fan broken"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="complaintCategory">Issue Category</label>
                <select
                  id="complaintCategory"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label htmlFor="complaintRoom">Room No. / Hostel Place 📍</label>
                <input
                  type="text"
                  id="complaintRoom"
                  placeholder="e.g. Room 204, Block B or Common Room"
                  required
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="complaintDescription">Detailed Problem Description</label>
              <textarea
                id="complaintDescription"
                placeholder="Describe your issue in detail..."
                rows="3"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </section>

        {/* My Complaints Card */}
        <section className="card">
          <div className="section-header">
            <div className="header-with-count">
              <h3>📋 My Submitted Complaints</h3>
              <span className="count-pill">{myComplaints.length} Total</span>
            </div>
            <p className="section-desc">Track status and review staff remarks on your issues</p>
          </div>

          <div id="myComplaintsList" className="complaint-cards-list">
            {myComplaints.length === 0 ? (
              <div className="empty-state">
                <p className="no-data">You haven't submitted any complaints yet.</p>
              </div>
            ) : (
              myComplaints.map((c) => (
                <article className="complaint-card" key={c.id}>
                  <div className="complaint-card-header">
                    <div className="complaint-title-group">
                      <span className="complaint-id-tag">{c.id}</span>
                      <h4>{c.title}</h4>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <p className="complaint-description">{c.description}</p>

                  <div className="complaint-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Location / Place:</span>
                      <span className="meta-value room-pill">📍 {c.roomNo || "Room Not Specified"}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Category:</span>
                      <span className="meta-value">{c.category}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Date Lodged:</span>
                      <span className="meta-value">{c.date}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Assigned Staff:</span>
                      <span className="meta-value">
                        {c.assignedStaff ? (
                          <strong>{c.assignedStaff}</strong>
                        ) : (
                          <em className="text-muted">Not assigned yet</em>
                        )}
                      </span>
                    </div>
                  </div>

                  {c.remark ? (
                    <div className="remark-box">
                      <span className="remark-label">Staff Resolution Note:</span>
                      <p className="remark-content">{c.remark}</p>
                    </div>
                  ) : (
                    <div className="remark-box-empty">
                      <span className="remark-label">Staff Remark:</span>
                      <span className="text-muted">No remark added yet.</span>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
