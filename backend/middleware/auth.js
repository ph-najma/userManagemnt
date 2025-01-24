const jwt = require("jsonwebtoken");
require("dotenv").config(); // To use environment variables

const verifyUserToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1]; // Get the token from the header

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, "najma_key", (err, decoded) => {
    // Use your secret here
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }

    req.userId = decoded._id; // Attach the user ID from the token to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

// Middleware to verify JWT token for admins
const verifyAdminToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1]; // Get the token from the header

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, "najma_key", (err, decoded) => {
    console.log(token);
    // Use your secret here
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }

    req.userId = decoded._id;
    console.log("Admin authenticated successfully. User ID:", req.userId); // Attach the user ID from the token to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = { verifyUserToken, verifyAdminToken };
