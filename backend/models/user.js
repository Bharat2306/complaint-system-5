import mongoose from 'mongoose';

const userschema=new mongoose.Schema({
    name:String,
    password:String,
    email:String,
    role:String
})

const User=mongoose.model("User",userschema);

export default User;