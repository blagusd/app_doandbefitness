const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const workoutRoutes = require("./routes/workoutRoutes");

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://appUser:%40db5780bd@localhost:27017/doandbefitness", {
    authSource: "doandbefitness",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/auth", authRoutes);
app.use("/api", progressRoutes);
app.use("/api", workoutRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
