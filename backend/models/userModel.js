const mongoose = require("mongoose");
const { type } = require("os");
const users = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_blocked: {
    type: Boolean,
    default: false,
  },
  address1: {
    type: String,
  },
  address2: {
    type: String,
  },
  mobileNo: {
    type: Number,
  },
  image: { type: String },
});
module.exports = mongoose.model("Users", users);
