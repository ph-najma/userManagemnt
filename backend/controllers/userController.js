const User = require("../models/userModel");
const Address = require("../models/addressModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const ObjectId = mongoose.Types.ObjectId;
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const saltRounds = 10;
let name;
let email;
let password;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // You need to create an 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

/*=====signup=====*/
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h", // Token expires in 1 hour
    }
  );
};
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = generateToken(newUser);

    // Return the token and user data to the frontend
    res.status(201).json({
      message: "Signup successful",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Something went wrong during signup" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user from database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Check if user is blocked or is not a normal user
    if (user.is_admin === 0 && !user.is_blocked) {
      // Generate token on successful login
      const token = generateToken(user);

      return res.status(200).json({
        message: "Login successful",
        token, // Return the token for authorization
      });
    } else {
      return res.status(400).json({ message: "You are not a valid user" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong during login" });
  }
};

/*=====User Profile======*/
const getUserById = async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId) {
      return res.status(400).json({ message: "user id is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
/*======Logout======*/
const setNoCache = (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};
const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.query; // Get user ID from the request parameters
    const updateData = {};

    console.log(req.body);

    // Only add properties that exist in the request body
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.sname) updateData.sname = req.body.sname;
    if (req.body.mobileNo) updateData.mobileNo = req.body.mobileNo;
    if (req.body.address1) updateData.address1 = req.body.address1;
    if (req.body.address2) updateData.address2 = req.body.address2;
    if (req.body.email) updateData.email = req.body.email;

    // Check if there is a file in the request

    console.log("from backend", req.file);
    if (req.file) {
      // If file is uploaded, add the path to updateData object
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Find the user by ID and update with the new data
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated user
      runValidators: true, // Optional: run validators for the updated fields
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Something went wrong during user update" });
  }
};

module.exports = {
  signup,
  login,
  updateUser,
  getUserById,
  upload,
  logout,
};
