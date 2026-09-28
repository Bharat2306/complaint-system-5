import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import Staff from './models/staff.js';
import User from './models/user.js';
import Category from './models/category.js';
import Complaint from './models/complaints.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ayush1149be24_db_user:Hostel2005@complaintcluster.nwlbow3.mongodb.net/hostelDB?appName=ComplaintCluster";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// API Root / Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Smart Hostel Complaint Management System API',
    version: '1.0.0'
  });
});

// 1. GET /api/staff - Get all maintenance staff members
app.get('/api/staff', (req, res) => {
  Staff.find()
    .then((staff) => {
      const staffNames = staff.map((s) => s.name);
      res.json({
        success: true,
        staff: staffNames,
        staffDetails: staff
      });
    })
    .catch((err) => {
      console.error("Error fetching staff:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch staff members."
      });
    });
});

// 2. GET /api/categories - Get complaint categories
app.get('/api/categories', (req, res) => {
  Category.find()
    .then((categories) => {
      const catNames = categories.map((cat) => cat.name);
      res.json({
        success: true,
        categories: catNames
      });
    })
    .catch((err) => {
      console.error("Error fetching categories:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories."
      });
    });
});

// 3. GET /api/complaints - Get all or filtered complaints
app.get('/api/complaints', (req, res) => {
  const { studentEmail, assignedStaff } = req.query;
  const filter = {};

  if (studentEmail) {
    filter.studentEmail = studentEmail.trim().toLowerCase();
  }

  if (assignedStaff) {
    filter.assignedStaff = assignedStaff.trim();
  }

  Complaint.find(filter)
    .sort({ _id: -1 })
    .then((complaints) => {
      res.json({
        success: true,
        complaints: complaints
      });
    })
    .catch((err) => {
      console.error("Error fetching complaints:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch complaints."
      });
    });
});

// 4. POST /api/login - User Authentication (Student, Staff, Admin)
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, password, and role."
    });
  }

  User.findOne({
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: role.trim().toLowerCase()
  })
    .then((user) => {
      if (user) {
        res.json({
          success: true,
          user: {
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid email, password, or role selection."
        });
      }
    })
    .catch((err) => {
      console.error("Login error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error during login."
      });
    });
});

// 5. POST /api/signup - Student Self-Registration
app.post('/api/signup', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all registration fields."
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match."
    });
  }

  User.findOne({ email: email.trim().toLowerCase() })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists."
        });
      }

      const user = new User({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: "student"
      });

      user.save()
        .then((savedUser) => {
          res.json({
            success: true,
            user: {
              name: savedUser.name,
              email: savedUser.email,
              role: savedUser.role
            }
          });
        })
        .catch((err) => {
          console.error("Error creating user:", err);
          res.status(500).json({
            success: false,
            message: "Failed to create account."
          });
        });
    })
    .catch((err) => {
      console.error("Error checking email:", err);
      res.status(500).json({
        success: false,
        message: "Failed to check email availability."
      });
    });
});

// 6. POST /api/submit-complaint - Register a new complaint
app.post('/api/submit-complaint', (req, res) => {
  const { title, category, roomNo, description, studentName, studentEmail } = req.body;

  if (!title || !category || !roomNo || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, category, room number, and description."
    });
  }

  Complaint.findOne().sort({ _id: -1 })
    .then((lastComplaint) => {
      let nextId = 1001;
      if (lastComplaint && lastComplaint.id && lastComplaint.id.startsWith("C")) {
        const parsed = parseInt(lastComplaint.id.substring(1), 10);
        if (!isNaN(parsed)) {
          nextId = parsed + 1;
        }
      }

      const complaint = new Complaint({
        id: "C" + nextId,
        studentName: studentName || "Anonymous Student",
        studentEmail: (studentEmail || "").trim().toLowerCase(),
        title: title.trim(),
        category: category.trim(),
        roomNo: roomNo.trim(),
        description: description.trim(),
        date: new Date().toLocaleDateString(),
        assignedStaff: "",
        status: "Pending",
        remark: ""
      });

      complaint.save()
        .then((savedComplaint) => {
          res.json({
            success: true,
            complaint: savedComplaint
          });
        })
        .catch((err) => {
          console.error("Error saving complaint:", err);
          res.status(500).json({
            success: false,
            message: "Failed to save complaint."
          });
        });
    })
    .catch((err) => {
      console.error("Error generating complaint ID:", err);
      res.status(500).json({
        success: false,
        message: "Failed to generate complaint ID."
      });
    });
});

// 7. POST /api/update-complaint - Update status, staff assignment, or remark
app.post('/api/update-complaint', (req, res) => {
  const { id, status, assignedStaff, remark } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Complaint ID is required."
    });
  }

  Complaint.findOne({ id: id })
    .then((complaint) => {
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found."
        });
      }

      if (assignedStaff !== undefined) {
        complaint.assignedStaff = assignedStaff;
        if (complaint.status === 'Pending' && assignedStaff) {
          complaint.status = 'Assigned';
        }
      }

      if (status !== undefined) {
        complaint.status = status;
      }

      if (remark !== undefined) {
        complaint.remark = remark;
      }

      complaint.save()
        .then((updatedComplaint) => {
          res.json({
            success: true,
            complaint: updatedComplaint
          });
        })
        .catch((err) => {
          console.error("Error updating complaint:", err);
          res.status(500).json({
            success: false,
            message: "Failed to update complaint."
          });
        });
    })
    .catch((err) => {
      console.error("Error finding complaint:", err);
      res.status(500).json({
        success: false,
        message: "Internal error locating complaint."
      });
    });
});

// 8. POST /api/add-staff - Admin adds new maintenance staff
app.post('/api/add-staff', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide staff name, email, and password."
    });
  }

  User.findOne({ email: email.trim().toLowerCase() })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user account with this email already exists."
        });
      }

      const staffMember = new Staff({
        name: name.trim()
      });

      staffMember.save()
        .then(() => {
          const staffUser = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
            role: "staff"
          });

          staffUser.save()
            .then(() => {
              res.json({
                success: true,
                message: `Staff member ${name.trim()} added successfully!`,
                staff: {
                  name: name.trim(),
                  email: email.trim().toLowerCase()
                }
              });
            })
            .catch((err) => {
              console.error("Error creating staff login:", err);
              res.status(500).json({
                success: false,
                message: "Failed to create staff login account."
              });
            });
        })
        .catch((err) => {
          console.error("Error saving staff member:", err);
          res.status(500).json({
            success: false,
            message: "Failed to save staff member."
          });
        });
    })
    .catch((err) => {
      console.error("Error checking existing staff:", err);
      res.status(500).json({
        success: false,
        message: "Failed to verify staff email availability."
      });
    });
});

// 9. POST /api/remove-staff - Admin removes maintenance staff
app.post('/api/remove-staff', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Staff name is required for removal."
    });
  }

  Staff.deleteOne({ name: name.trim() })
    .then(() => {
      User.deleteMany({ name: name.trim(), role: "staff" })
        .then(() => {
          res.json({
            success: true,
            message: `Staff member "${name.trim()}" removed successfully!`
          });
        })
        .catch((err) => {
          console.error("Error removing staff login:", err);
          res.status(500).json({
            success: false,
            message: "Failed to remove staff login account."
          });
        });
    })
    .catch((err) => {
      console.error("Error removing staff:", err);
      res.status(500).json({
        success: false,
        message: "Failed to delete staff member."
      });
    });
});

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}...`);
});
