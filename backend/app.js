const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const port = 3000;

app.use(cors());
app.use(express.json());
const userRoutes = require("./routes/userRoute");
app.use(userRoutes);
const adminRoutes = require("./routes/adminRoute");
app.use(adminRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Helloo");
});

app.listen(port, () => {
  console.log("Server running on port 3000");
});
