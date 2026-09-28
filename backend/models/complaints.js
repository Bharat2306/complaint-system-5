import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    id: String,
    studentName: String,
    studentEmail: String,
    title: String,
    category: String,
    roomNo: String,
    description: String,
    date: String,
    assignedStaff: String,
    status: String,
    remark: String
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;