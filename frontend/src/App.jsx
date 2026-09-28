import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Student from "./pages/Student";
import Staff from "./pages/Staff";
import Admin from "./pages/Admin";

/* Application Routes:
   "/"        -> Login (Student, Staff, Admin)
   "/signup"  -> Student Registration
   "/student" -> Student Dashboard
   "/staff"   -> Staff Dashboard
   "/admin"   -> Admin Dashboard */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student" element={<Student />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
