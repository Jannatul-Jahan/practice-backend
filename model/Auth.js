const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Emails was not provided"],
    maxLength: 30,
  },
  password: {
    type: String,
    unique: true,
    required: [true, "Password was not provided"],
  },
  role: {
    type: Number,
    required: false,
    default:2
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    // required: true,
  },
},
  {
    timestamps: true, // Add timestamps option here
  });
  
const Auth = mongoose.model("Auth", AuthSchema);
module.exports = Auth;
