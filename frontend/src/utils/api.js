/* =====================================================================
   api.js
   Centralized HTTP client for communicating with the Node.js backend.
   Uses the standard browser fetch() API to make HTTP requests.
   ===================================================================== */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ---------------------------------------------------------------------
   1. SESSION / CURRENT LOGGED-IN USER (Browser Storage)
   --------------------------------------------------------------------- */
export function getCurrentUser() {
  const data = localStorage.getItem("shcms_currentUser");
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user) {
  localStorage.setItem("shcms_currentUser", JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem("shcms_currentUser");
}

/* ---------------------------------------------------------------------
   2. HTTP API CALLS TO NODE.JS BACKEND
   --------------------------------------------------------------------- */

// Fetch the list of available hostel staff members
export async function getStaffList() {
  try {
    const response = await fetch(`${API_BASE_URL}/staff`);
    const data = await response.json();
    return data.staff || [];
  } catch (err) {
    console.error("HTTP Error fetching staff list:", err);
    // Fallback static list in case server is unreachable
    return ["Ramesh Kumar", "Suresh Singh", "Anita Sharma", "Vikas Yadav"];
  }
}

// Fetch the complaint categories
export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    return data.categories || [];
  } catch (err) {
    console.error("HTTP Error fetching categories:", err);
    return [
      "Electricity",
      "Plumbing",
      "Wifi / Internet",
      "Cleanliness",
      "Food / Mess",
      "Furniture",
      "Other",
    ];
  }
}

// Login API call
export async function loginUser({ name, email, password, role }) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("HTTP Error during login:", err);
    return {
      success: false,
      message: "Unable to connect to the backend server. Please make sure Node.js is running.",
    };
  }
}

// Student Signup API call
export async function signupUser({ name, email, password, confirmPassword }) {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("HTTP Error during signup:", err);
    return {
      success: false,
      message: "Unable to connect to the backend server. Please make sure Node.js is running.",
    };
  }
}

// Get complaints (optional filter by studentEmail or assignedStaff)
export async function getComplaints(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.studentEmail) params.append("studentEmail", filters.studentEmail);
    if (filters.assignedStaff) params.append("assignedStaff", filters.assignedStaff);

    const url = `${API_BASE_URL}/complaints${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.complaints || [];
  } catch (err) {
    console.error("HTTP Error fetching complaints:", err);
    return [];
  }
}

// Submit a new complaint
export async function submitComplaint(complaintData) {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(complaintData),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("HTTP Error submitting complaint:", err);
    return {
      success: false,
      message: "Failed to submit complaint. Server connection error.",
    };
  }
}

// Update complaint (change status, assign staff, or add remarks)
export async function updateComplaint({ id, status, assignedStaff, remark }) {
  try {
    const response = await fetch(`${API_BASE_URL}/update-complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, assignedStaff, remark }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("HTTP Error updating complaint:", err);
    return {
      success: false,
      message: "Failed to update complaint. Server connection error.",
    };
  }
}

// Add a new staff member (Admin only)
export async function addStaff({ name, email, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/add-staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("HTTP Error adding staff:", err);
    return {
      success: false,
      message: "Failed to add staff member. Server connection error.",
    };
  }
}

// Remove a staff member (Admin only)
export async function removeStaff({ name }) {
  try {
    const response = await fetch(`${API_BASE_URL}/remove-staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("HTTP Error removing staff:", err);
    return {
      success: false,
      message: "Failed to remove staff member. Server connection error.",
    };
  }
}

