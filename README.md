# 🚀 FixPoint - Smart Campus Complaint Management System

FixPoint is a modern, full-stack web application designed for educational institutions, university campuses, and residential complexes to streamline complaint registration, administrative task assignment, technician workflow management, and resolution tracking.

---

## 🌟 Key Features

### 🎓 **Student Portal**
- **Easy Sign-Up & Login**: Register with student email and room/hostel details.
- **Raise Complaints with Evidence**: Upload photos or video clips with location details.
- **Real-Time Status Tracking**: Live progress bar (`Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
- **Interactive Technician Chat**: Communicate directly with assigned staff per ticket.
- **Feedback & Rating System**: Rate resolution quality (1 to 5 stars) and leave closing comments.

### 🛠️ **Staff / Technician Portal**
- **Unique Staff ID Login**: Register and log in using custom Employee/Staff IDs (e.g. `STF-101`).
- **Task Dashboard ("My Assigned Tasks")**: Filter complaints assigned specifically to you or your department.
- **Comprehensive Task Details**: View problem title, category, student details, and location (e.g., *Hostel Room 203*).
- **1-Click Status Updates**: Quickly transition tickets from `Assigned` ➔ `In Progress` ➔ `Resolved`.
- **"Mark Work as Completed" Action**: Instant status completion button with optional staff notes.

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

- **Backend / API**: Node.js, Express.js (RESTful APIs & Middleware Routing)
- **Database / Data Layer**: MongoDB (Mongoose Schemas) with Zero-Config In-Memory Fallback Engine
- **Authentication & Security**: JSON Web Tokens (JWT `jsonwebtoken`), Bcrypt.js Password Hashing, CORS
- **File Uploads**: Multer Middleware (Photo & Video Attachments)
- **Frontend**: HTML5, Vanilla JavaScript (ES6+ Single-Page Application Architecture), Modern CSS3 Design System
- **Themes & UI**: CSS Variables (Dark/Light Modes), Font Awesome 6 Icons, Google Fonts (*Plus Jakarta Sans*)
- **Deployment**: Vercel Serverless Functions (`vercel.json`) & Node.js

---

## 📁 Project Structure

```
complaint-system/
├── api/
│   └── index.js              # Vercel Serverless application entry point
├── config/
│   └── db.js                 # MongoDB connection & status logger
├── middleware/
│   └── verifyToken.js        # JWT authentication & authorization middleware
├── models/
│   ├── User.js               # User Schema (Student, Admin, Staff)
│   ├── Complaint.js          # Complaint Schema & Timeline
│   └── Message.js            # Support Chat Message Schema
├── routes/
│   ├── authRoutes.js         # Register, Login & Profile Endpoints
│   ├── adminRoutes.js        # Admin Overview & Management Endpoints
│   ├── staffRoutes.js        # Technician Task & Status Endpoints
│   ├── complaintRoutes.js    # Raise, Assign, Status Update & Feedback Endpoints
│   └── chatRoutes.js         # Real-time Chat Endpoints
├── services/
│   └── dataStore.js          # Dual Storage Engine (MongoDB + In-Memory Fallback)
├── public/
│   ├── css/
│   │   └── style.css         # Modern Theme System (Light/Dark Mode, Glassmorphism, Modals)
│   ├── js/
│   │   ├── api.js            # Centralized API Service Layer
│   │   └── app.js            # Main Application Logic & UI State Controller
│   └── index.html            # Unified Single-Page Interface
├── uploads/                  # Media attachment directory
├── cleanDb.js                # Database & Uploads reset utility script
├── server.js                 # Local Express Application Entry Point
├── vercel.json               # Vercel deployment configuration
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
   *(For development mode: `npm run dev`)*

4. **Reset / Clean Database (Optional)**:
   ```bash
   npm run clean-db
   ```

5. **Open in browser**:
   Navigate to `http://localhost:5000`

---

## 📡 API Endpoints Summary

### Authentication Routes (`/api/auth`)
- `POST /api/auth/signup`: Create a new Student, Staff, or Admin account.
- `POST /api/auth/login`: Authenticate via Email or Staff Unique ID.
- `GET /api/auth/profile`: Fetch currently authenticated user profile.

### Complaint Routes (`/api/complaints`)
- `GET /api/complaints`: Fetch complaints (Role and Filter based).
- `POST /api/complaints/raise`: Submit a new complaint with media files.
- `PATCH /api/complaints/:ticketId/assign`: Assign complaint to staff member.
- `PATCH /api/complaints/:ticketId/status`: Update complaint progress status.
- `POST /api/complaints/:ticketId/feedback`: Submit rating and close complaint.
- `GET /api/complaints/meta/staff`: Fetch list of staff technicians for Admin assignment.

### Admin & Staff Specific Routes
- `GET /api/admin/users`: List all registered system users.
- `GET /api/admin/complaints`: Fetch system-wide complaint overview.
- `GET /api/staff/complaints`: Fetch technician assigned tasks.

### Chat Routes (`/api/chat`)
- `GET /api/chat/:ticketId`: Fetch resolution chat messages for a complaint ticket.
- `POST /api/chat/:ticketId`: Send a chat message.

---

## 📜 License
This project is licensed under the MIT License.
