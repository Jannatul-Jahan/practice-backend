const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username was not provided"],
    maxLength: 30,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email was not provided"],
  },
  address: {
    type: String,
    maxLength: 30,
  },
  
});

const User = mongoose.model("User", userSchema);
module.exports = User;
