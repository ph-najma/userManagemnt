const express = require("express");
const router = express.Router();
const { verifyUserToken } = require("../middleware/auth");

const userController = require("../controllers/userController");
const connectToDatabase = require("../db");
connectToDatabase();

router.post("/signup", userController.signup);

router.post("/login", userController.login);

router.post(
  "/updateUser",
  verifyUserToken,
  userController.upload.single("image"),
  userController.updateUser
);

router.get("/profile", verifyUserToken, userController.getUserById);

router.get("/logout", userController.logout);
module.exports = router;
