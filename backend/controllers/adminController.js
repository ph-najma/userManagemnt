const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const saltRounds = 10;

/*====Login======*/
const renderAdmin = (req, res) => {
  let emailError = "";
  let passwordError = "";
  res.render("adminLogin", { emailError, passwordError });
};

const checkLoggedIn = (req, res, next) => {
  if (req.session.loginadminSuccess) {
    res.redirect("/dashboard"); // Redirect to dashboard if logged in
  } else {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // Add cache control headers
    next(); // Continue to the next middleware/route handler
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let emailError = "";
    let passwordError = "";
    console.log(req.body);

    const check = await User.findOne({ email });
    if (!check) {
      emailError = "Email not found";
      return res.status(400).json({ emailError });
    }

    const passmatch = await bcrypt.compare(password, check.password);
    if (!passmatch) {
      passwordError = "Wrong password";
      return res.status(400).json({ passwordError });
    }

    console.log(check);

    // Check if user is an admin
    if (check.is_admin === 1) {
      // Generate a JWT token for the admin
      const token = jwt.sign(
        { _id: check._id, email: check.email, is_admin: check.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Token expiration
      );

      // Send the token to the frontend
      res.status(200).json({
        message: "Login successful",
        token,
      });
    } else {
      emailError = "Access denied. Not an admin.";
      res.status(403).json({ emailError });
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Something went wrong during login" });
  }
};

/*=======User======*/
const userList = async (req, res) => {
  try {
    const userdata = await User.find({ is_admin: 0, is_blocked: false });

    res.json({ data: userdata });
  } catch (error) {
    res.render("error", {
      message: "Something went wrong in loading userList",
    });
  }
};
const blockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.is_blocked = true;
    await user.save();

    // Destroy user session
    const sessionStore = req.sessionStore; // Access the session store
    sessionStore.all((err, sessions) => {
      if (err) {
        console.error("Error fetching sessions:", err);
        return res.render("error", {
          message: "Something went wrong in blocking user",
        });
      }

      // Find and destroy the session of the blocked user
      for (let sessionId in sessions) {
        if (
          sessions[sessionId].user &&
          sessions[sessionId].user._id.toString() === userId
        ) {
          sessionStore.destroy(sessionId, (err) => {
            if (err) {
              console.error("Error destroying session:", err);
            }
          });
        }
      }
    });

    return res.redirect("/usermanagement");
  } catch (error) {
    res.render("error", { message: "Something went wrong in blocking user" });
  }
};

const unBlockUser = async (req, res) => {
  try {
    const userid = req.query.id;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).send("user not found");
    }
    user.is_blocked = false;
    await user.save();
    return res.redirect("/usermanagement");
  } catch (error) {
    res.render("error", { message: "Something went wrong in Unblocking user" });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out.");
    }
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.redirect(`/login`);
    // Ensure headers prevent caching
  });
};

const createNewUser = async (req, res) => {
  try {
    const { name, email, password, mobileNo, address1, address2 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNo,
      address1,
      address2,
    });

    await newUser.save();

    // Return the token and user data to the frontend
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Something went wrong during signup" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.is_blocked = true;
    await user.save();
    res.status(201).json({
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("Error during deleting:", error);
    res.status(500).json({ message: "Something went wrong during deleting" });
  }
};

module.exports = {
  renderAdmin,
  adminLogin,
  userList,
  blockUser,
  unBlockUser,
  createNewUser,
  deleteUser,
  logout,
};
