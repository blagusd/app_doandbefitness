const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/authRoutes");
const progressRoutes = require("./src/routes/progressRoutes");
const exerciseRoutes = require("./src/routes/exerciseRoutes");
const userRoutes = require("./src/routes/userRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const weeklyPlanRoutes = require("./src/routes/weeklyPlanRoutes");
const exerciseVideoRoutes = require("./src/routes/exerciseVideoRoutes");

const errorHandler = require("./src/middleware/errorHandler");
const securityMiddleware = require("./src/middleware/securityMiddleware");

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://appdoandbefitness.netlify.app",
      "https://doandbefitness.com",
      "https://www.doandbefitness.com",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use("/uploads", express.static("uploads"));
app.use(express.json());

securityMiddleware(app);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/weekly-plan", weeklyPlanRoutes);
app.use("/exercise-videos", exerciseVideoRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
