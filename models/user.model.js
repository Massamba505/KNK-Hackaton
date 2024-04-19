const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    problem_id:{
        type:String
    }
})

const UserModel = new mongoose.model("User",UserSchema);

module.exports = UserModel;