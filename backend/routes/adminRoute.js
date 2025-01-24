const express = require("express");
const router = express.Router();

const { verifyAdminToken } = require("../middleware/auth");
const adminController = require("../controllers/adminController");
const connectToDatabase = require("../db");
connectToDatabase();

router.post("/loginAdmin", adminController.adminLogin);
router.get("/userList", verifyAdminToken, adminController.userList);
router.post("/createNewUser", verifyAdminToken, adminController.createNewUser);
router.delete("/deleteUser", verifyAdminToken, adminController.deleteUser);

router.get("/logoutAdmin", adminController.logout);

module.exports = router;
