# 🚀 FixPoint - Smart Campus Complaint Management System

FixPoint is a modern, full-stack web application designed for educational institutions, university campuses, and residential complexes to streamline complaint registration, administrative task assignment, technician workflow management, and resolution tracking.

---

## 🌟 Key Features

### 🎓 **Student Portal**
- **Easy Sign-Up & Login**: Register with student email and room/hostel details.
- **Raise Complaints with Evidence**: Upload photos or video clips with location details.
- **Real-Time Status Tracking**: Live progress bar (`Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
- **Interactive Technician Chat**: Communicate directly with assigned staff.
- **Feedback & Rating System**: Rate resolution quality (1 to 5 stars) and leave closing comments.

### 🛠️ **Staff / Technician Portal**
- **Unique Staff ID Login**: Register and log in using custom Employee/Staff IDs (e.g. `STF-101`).
- **Task Dashboard ("My Assigned Tasks")**: Filter complaints assigned specifically to you.
- **Comprehensive Task Details**: View problem title, category, student details, and location (e.g., *Hostel Room 203*).
- **1-Click Status Updates**: Quickly transition tickets from `Assigned` ➔ `In Progress` ➔ `Resolved`.
- **"Mark Work as Completed" Action**: Instant status completion button.

### 🛡️ **Admin Portal**
- **Centralized Complaint Overview**: Monitor all campus complaints across departments.
- **Staff List & Assignment**: View registered staff members (Name, Staff ID, Department) and assign tickets seamlessly.
- **Timeline Audit & Notes**: Add official administrative notes for students and staff.

---

## 🔑 Demo Credentials

| Role | Email / Unique ID | Password | Access Type |
|---|---|---|---|
| 🎓 **Student** | `student@campus.edu` | `password123` | Student Dashboard |
| 🛠️ **Staff (Electrician)** | `staff@campus.edu` or `STF-101` | `staff123` | Staff Portal |
| 🛠️ **Staff (IT Support)** | `itstaff@campus.edu` or `STF-102` | `staff123` | Staff Portal |
| 👑 **Admin** | `admin@campus.edu` | `admin123` | Admin Portal |

---

## 💻 Tech Stack

- **Backend**: Node.js, Express.js
- **Database / Data Layer**: MongoDB (Mongoose Schema) with Zero-Config In-Memory Fallback
- **FileUploads**: Multer (Photos & Videos)
- **Security**: Bcrypt.js (Password Hashing)
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Modern Custom CSS (Dark/Light Modes)
- **Fonts & Icons**: Font Awesome 6, Google Fonts (Plus Jakarta Sans)

---

## 📁 Project Structure

```
complaint-system/
├── config/
│   └── db.js                 # MongoDB connection & status logger
├── models/
│   ├── User.js               # User Schema (Student, Admin, Staff)
│   ├── Complaint.js          # Complaint Schema & Timeline
│   └── Message.js            # Support Chat Message Schema
├── routes/
│   ├── authRoutes.js         # Register & Login Endpoints
│   ├── complaintRoutes.js    # Raise, Assign, Status Update & Feedback Endpoints
│   └── chatRoutes.js         # Real-time Chat Endpoints
├── services/
│   └── dataStore.js          # Dual Storage Engine (MongoDB + In-Memory Fallback)
├── public/
│   ├── css/
│   │   └── style.css         # Modern Theme System (Light/Dark Mode, Cards, Modals)
│   ├── js/
│   │   ├── api.js            # API Service Layer
│   │   └── app.js            # Main Application Logic
│   └── index.html            # Unified Single-Page Interface
├── uploads/                  # Media attachment directory
├── server.js                 # Express Application Entry Point
├── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Bharat2306/complaint-system-5.git
   cd complaint-system-5
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5000`

---

## 📡 API Endpoints Summary

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register`: Create a new Student, Staff, or Admin account.
- `POST /api/auth/login`: Authenticate via Email or Staff Unique ID.

### Complaint Routes (`/api/complaints`)
- `GET /api/complaints`: Fetch complaints (Role-filtered).
- `POST /api/complaints/raise`: Submit a new complaint with media files.
- `PATCH /api/complaints/:ticketId/assign`: Assign complaint to staff member.
- `PATCH /api/complaints/:ticketId/status`: Update complaint progress status.
- `POST /api/complaints/:ticketId/feedback`: Submit rating and close complaint.
- `GET /api/complaints/meta/staff`: Fetch list of staff technicians for Admin assignment.

### Chat Routes (`/api/chat`)
- `GET /api/chat/:ticketId`: Fetch resolution chat messages.
- `POST /api/chat/:ticketId`: Send a chat message.

---

## 📜 License
This project is licensed under the MIT License.
