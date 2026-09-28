import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    name: String
});

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;